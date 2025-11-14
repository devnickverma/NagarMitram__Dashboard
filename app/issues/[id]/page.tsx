'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  ImageList,
  ImageListItem,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Schedule,
  Person,
  Assignment,
  PhotoCamera,
  Update,
  CheckCircle,
  Warning,
  Error,
  Notifications,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { notificationService } from '@/lib/services/notificationService';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'in-progress' | 'resolved';
  location: string;
  latitude: number;
  longitude: number;
  images?: string[];
  reportedBy: string;
  userId?: string; // User ID of the reporter
  reportedAt: Date;
  assignedTo?: string;
  estimatedResolution?: Date;
  updates: {
    id: string;
    message: string;
    timestamp: Date;
    author: string;
  }[];
}

const availableTeams = [
  { id: 'team-a', name: 'Team A - Roads & Infrastructure', department: 'Public Works' },
  { id: 'team-b', name: 'Team B - Lighting & Electrical', department: 'Electrical' },
  { id: 'team-c', name: 'Team C - Sanitation', department: 'Sanitation' },
  { id: 'team-d', name: 'Team D - Parks & Recreation', department: 'Parks' },
  { id: 'team-e', name: 'Team E - Water & Drainage', department: 'Water Works' },
];

export default function IssueDetail() {
  const params = useParams();
  const router = useRouter();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadIssue();
    }
  }, [params.id]);

  const loadIssue = async () => {
    try {
      setLoading(true);
      const { data: issueData, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error loading issue:', error);
        return;
      }

      if (issueData) {
        // Extract location from JSONB if it's an object
        let locationStr = 'Unknown location';
        let lat = 0;
        let lng = 0;

        if (issueData.location && typeof issueData.location === 'object') {
          locationStr = issueData.location.address || 'Unknown location';
          lat = parseFloat(issueData.location.latitude) || 0;
          lng = parseFloat(issueData.location.longitude) || 0;
        } else if (typeof issueData.location === 'string') {
          locationStr = issueData.location;
          lat = parseFloat(issueData.latitude) || 0;
          lng = parseFloat(issueData.longitude) || 0;
        }

        // Transform Supabase data to Issue type
        const transformedIssue: Issue = {
          id: issueData.id,
          title: issueData.title || 'Untitled Issue',
          description: issueData.description || 'No description provided',
          category: issueData.category || 'General',
          priority: (issueData.priority || 'medium') as 'high' | 'medium' | 'low',
          status: (issueData.status || 'new') as 'new' | 'in-progress' | 'resolved',
          location: locationStr,
          latitude: lat,
          longitude: lng,
          images: Array.isArray(issueData.images) ? issueData.images : [],
          reportedBy: issueData.user_name || 'Anonymous',
          userId: issueData.user_id || undefined,
          reportedAt: new Date(issueData.created_at),
          assignedTo: issueData.assigned_to || undefined,
          updates: [
            {
              id: '1',
              message: 'Issue reported and under review',
              timestamp: new Date(issueData.created_at),
              author: 'System'
            }
          ]
        };

        setIssue(transformedIssue);
      }
    } catch (error) {
      console.error('Error loading issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#f44336';
      case 'in-progress': return '#ff9800';
      case 'resolved': return '#4caf50';
      default: return '#757575';
    }
  };

  const handleAssignTeam = async () => {
    if (selectedTeam && issue) {
      const team = availableTeams.find(t => t.id === selectedTeam);

      // Update in Supabase
      const { error } = await supabase
        .from('issues')
        .update({
          assigned_to: team?.name || '',
          status: 'in-progress'
        })
        .eq('id', issue.id);

      if (error) {
        console.error('Error assigning team:', error);
        return;
      }

      // Create notification for the issue reporter
      if (issue.userId) {
        await notificationService.createNotification({
          user_id: issue.userId,
          type: 'assignment',
          title: 'Issue Assigned',
          message: `Your issue "${issue.title}" has been assigned to ${team?.name}`,
          issue_id: issue.id,
        });
      }

      setIssue(prev => prev ? ({
        ...prev,
        assignedTo: team?.name || '',
        status: 'in-progress',
        updates: [
          ...prev.updates,
          {
            id: Date.now().toString(),
            message: `Issue assigned to ${team?.name}`,
            timestamp: new Date(),
            author: 'Admin'
          }
        ]
      }) : null);
      setAssignDialogOpen(false);
      setSelectedTeam('');
      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 3000);
    }
  };

  const handleAddUpdate = async () => {
    if (updateMessage.trim() && issue) {
      // Update in Supabase (you could add an updates table, but for now just update status)
      const { error } = await supabase
        .from('issues')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', issue.id);

      if (error) {
        console.error('Error adding update:', error);
        return;
      }

      setIssue(prev => prev ? ({
        ...prev,
        updates: [
          ...prev.updates,
          {
            id: Date.now().toString(),
            message: updateMessage,
            timestamp: new Date(),
            author: 'Admin'
          }
        ]
      }) : null);
      setUpdateDialogOpen(false);
      setUpdateMessage('');
      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 3000);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#55a08c' }} />
      </Box>
    );
  }

  if (!issue) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => router.back()}
            sx={{ mr: 2, color: '#757575' }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Issue Not Found
          </Typography>
        </Box>
        <Alert severity="error">
          The requested issue could not be found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => router.back()}
          sx={{ mr: 2, color: '#757575' }}
        >
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
            Issue Details
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            {issue.id} • Reported {formatTimeAgo(issue.reportedAt)}
          </Typography>
        </Box>
      </Box>

      {/* Notification Alert */}
      {notificationSent && (
        <Alert 
          severity="success" 
          icon={<Notifications />}
          sx={{ mb: 3 }}
        >
          User has been notified about the update
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              {/* Issue Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box
                      component="span"
                      sx={{
                        px: 0.75,
                        py: 0.125,
                        borderRadius: 0.5,
                        fontSize: 10,
                        fontWeight: 500,
                        backgroundColor: '#f0f0f0',
                        color: '#424242',
                        border: '1px solid #e0e0e0',
                        display: 'inline-block',
                      }}
                    >
                      {issue.category}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        px: 0.75,
                        py: 0.125,
                        borderRadius: 0.5,
                        fontSize: 10,
                        fontWeight: 500,
                        backgroundColor: getStatusColor(issue.status),
                        color: '#ffffff',
                        display: 'inline-block',
                        textTransform: 'capitalize',
                      }}
                    >
                      {issue.status}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        px: 0.75,
                        py: 0.125,
                        borderRadius: 0.5,
                        fontSize: 10,
                        fontWeight: 500,
                        backgroundColor: getPriorityColor(issue.priority),
                        color: '#ffffff',
                        display: 'inline-block',
                        textTransform: 'capitalize',
                      }}
                    >
                      {issue.priority}
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                    {issue.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#424242', lineHeight: 1.6 }}>
                    {issue.description}
                  </Typography>
                </Box>
              </Box>

              {/* Issue Details */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationOn sx={{ fontSize: 18, color: '#757575' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                        Location
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#757575' }}>
                        {issue.location}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
                        {issue.latitude}, {issue.longitude}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Person sx={{ fontSize: 18, color: '#757575' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                        Reported By
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#757575' }}>
                        {issue.reportedBy}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Images */}
              {issue.images && issue.images.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhotoCamera sx={{ fontSize: 18 }} />
                    Attached Images ({issue.images.length})
                  </Typography>
                  <ImageList cols={3} gap={12}>
                    {issue.images.map((image, index) => (
                      <ImageListItem key={index}>
                        <Box
                          component="img"
                          src={image}
                          alt={`Issue image ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 1,
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #e0e0e0'
                          }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Updates Timeline */}
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Update sx={{ fontSize: 18 }} />
                Updates & Communication
              </Typography>
              <List sx={{ p: 0 }}>
                {issue.updates.map((update, index) => (
                  <ListItem key={update.id} sx={{ px: 0, alignItems: 'flex-start' }}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        backgroundColor: update.author === 'System' ? '#e3f2fd' : '#b0d1c7',
                        color: update.author === 'System' ? '#1976d2' : '#ffffff',
                        fontSize: 12
                      }}>
                        {update.author === 'System' ? 'S' : 'A'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                          {update.message}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: '#757575' }}>
                          {update.author} • {formatTimeAgo(update.timestamp)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Assignment />}
                  onClick={() => setAssignDialogOpen(true)}
                  sx={{
                    backgroundColor: '#55a08c',
                    '&:hover': { backgroundColor: '#4a8f7a' },
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                  disabled={issue.status === 'resolved'}
                >
                  {issue.assignedTo ? 'Reassign Team' : 'Assign Team'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Update />}
                  onClick={() => setUpdateDialogOpen(true)}
                  sx={{
                    borderColor: '#55a08c',
                    color: '#55a08c',
                    '&:hover': { 
                      borderColor: '#4a8f7a',
                      backgroundColor: 'rgba(85, 160, 140, 0.04)'
                    },
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Add Update
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Assignment Info */}
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                Assignment Details
              </Typography>
              {issue.assignedTo ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Assignment sx={{ fontSize: 16, color: '#757575' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                      Assigned To
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#424242', mb: 2 }}>
                    {issue.assignedTo}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#757575', fontStyle: 'italic' }}>
                  No team assigned yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assign Team Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Team to Issue</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Select Team"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            sx={{ mt: 2 }}
          >
            {availableTeams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {team.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    {team.department}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignTeam} 
            variant="contained"
            sx={{ backgroundColor: '#55a08c', '&:hover': { backgroundColor: '#4a8f7a' } }}
          >
            Assign Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Update Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Status Update</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            fullWidth
            label="Update Message"
            value={updateMessage}
            onChange={(e) => setUpdateMessage(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Enter update message for the user..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddUpdate} 
            variant="contained"
            sx={{ backgroundColor: '#55a08c', '&:hover': { backgroundColor: '#4a8f7a' } }}
          >
            Send Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}