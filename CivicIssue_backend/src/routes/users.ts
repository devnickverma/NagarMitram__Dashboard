import express from 'express';
import { body, validationResult } from 'express-validator';
import { User, Issue } from '../models';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.id;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user statistics
    const totalReports = await Issue.count({ where: { reportedBy: userId } });
    const resolvedReports = await Issue.count({ 
      where: { reportedBy: userId, status: 'resolved' } 
    });
    const inProgressReports = await Issue.count({ 
      where: { reportedBy: userId, status: 'in-progress' } 
    });

    res.json({
      ...user.toJSON(),
      stats: {
        totalReports,
        resolvedReports,
        inProgressReports,
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional(),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = (req as any).user.id;
    const { name, email, phone } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already taken (if updating email)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update user
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone !== undefined) updates.phone = phone;

    await user.update(updates);

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin', 'staff']), async (req: express.Request, res: express.Response) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    
    const where: any = {};
    if (role && role !== 'all') where.role = role;
    if (status && status !== 'all') where.status = status;
    
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req: express.Request, res: express.Response) => {
  try {
    const { name, email, phone, role, status } = req.body;
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (role) updates.role = role;
    if (status) updates.status = status;

    await user.update(updates);

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;