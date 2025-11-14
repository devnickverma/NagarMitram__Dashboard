import express from 'express';
import { body, validationResult } from 'express-validator';
import { Issue, User } from '../models';
import { authenticateToken } from '../middleware/auth';
import { Op } from 'sequelize';

const router = express.Router();

// Get all issues (with optional filters)
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const { status, category, priority, search, page = 1, limit = 10 } = req.query;
    
    const where: any = {};
    
    if (status && status !== 'all') where.status = status;
    if (category && category !== 'all') where.category = category;
    if (priority && priority !== 'all') where.priority = priority;
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: issues } = await Issue.findAndCountAll({
      where,
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      issues,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get issues by location (nearby)
router.get('/nearby', async (req: express.Request, res: express.Response) => {
  try {
    const { latitude, longitude, radius = 1000 } = req.query; // radius in meters
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Simple distance calculation (not perfect for large distances but good enough for city-level)
    const lat = Number(latitude);
    const lon = Number(longitude);
    const radiusInDegrees = Number(radius) / 111320; // Convert meters to degrees (approximately)

    const issues = await Issue.findAll({
      where: {
        latitude: {
          [Op.between]: [lat - radiusInDegrees, lat + radiusInDegrees]
        },
        longitude: {
          [Op.between]: [lon - radiusInDegrees, lon + radiusInDegrees]
        }
      },
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(issues);
  } catch (error) {
    console.error('Get nearby issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's issues
router.get('/my-issues', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.id;
    
    const issues = await Issue.findAll({
      where: { reportedBy: userId },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(issues);
  } catch (error) {
    console.error('Get user issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single issue
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const issue = await Issue.findByPk(req.params.id, {
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json(issue);
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create issue
router.post('/', authenticateToken, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('latitude').isNumeric().withMessage('Valid latitude is required'),
  body('longitude').isNumeric().withMessage('Valid longitude is required'),
  body('address').notEmpty().withMessage('Address is required'),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = (req as any).user.id;
    const { title, description, category, priority, latitude, longitude, address, images } = req.body;

    const issue = await Issue.create({
      title,
      description,
      category,
      priority: priority || 'medium',
      latitude: Number(latitude),
      longitude: Number(longitude),
      address,
      images: images ? JSON.stringify(images) : undefined,
      reportedBy: userId,
      status: 'new',
    });

    const issueWithReporter = await Issue.findByPk(issue.id, {
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(201).json(issueWithReporter);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update issue (admin/staff only)
router.put('/:id', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Only allow admin/staff to update, or user updating their own issue
    if (userRole === 'citizen' && issue.reportedBy !== userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const allowedUpdates = userRole === 'citizen' 
      ? ['title', 'description'] 
      : ['title', 'description', 'status', 'priority', 'assignedTo'];

    const updates: any = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await issue.update(updates);

    const updatedIssue = await Issue.findByPk(issue.id, {
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.json(updatedIssue);
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete issue (admin only)
router.delete('/:id', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userRole = (req as any).user.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    await issue.destroy();
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics
router.get('/stats/overview', async (req: express.Request, res: express.Response) => {
  try {
    const totalIssues = await Issue.count();
    const resolvedIssues = await Issue.count({ where: { status: 'resolved' } });
    const inProgressIssues = await Issue.count({ where: { status: 'in-progress' } });
    const newIssues = await Issue.count({ where: { status: 'new' } });

    // This week's resolved issues
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const resolvedThisWeek = await Issue.count({
      where: {
        status: 'resolved',
        updatedAt: { [Op.gte]: oneWeekAgo }
      }
    });

    res.json({
      totalIssues,
      resolvedIssues,
      inProgressIssues,
      newIssues,
      resolvedThisWeek,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;