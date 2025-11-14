'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  LocationOn,
  Schedule,
  Person,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { useRealtimeIssues } from '@/lib/hooks/useRealtimeIssues';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  location: string;
  latitude?: number;
  longitude?: number;
  assigned_to?: string;
  user_name: string;
  created_at: string;
  images?: string[];
}

export default function Issues() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();
  }, []);

  // Subscribe to real-time issue updates
  useRealtimeIssues(() => {
    console.log('Issue updated - refreshing issues list');
    loadIssues();
  });

  const loadIssues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Normalize issues to extract location fields from JSONB
      const normalizedIssues = (data || []).map(issue => {
        if (issue.location && typeof issue.location === 'object') {
          return {
            ...issue,
            latitude: issue.location.latitude,
            longitude: issue.location.longitude,
            location: issue.location.address || 'Unknown location',
          };
        }
        return issue;
      });

      setIssues(normalizedIssues);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (issue.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Error sx={{ color: '#f44336', fontSize: 16 }} />;
      case 'medium': return <Warning sx={{ color: '#ff9800', fontSize: 16 }} />;
      case 'low': return <CheckCircle sx={{ color: '#4caf50', fontSize: 16 }} />;
      default: return null;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
          Issues Management ({issues.length})
        </Typography>
        <Button
          variant="outlined"
          sx={{
            borderColor: '#e0e0e0',
            color: '#424242',
            '&:hover': {
              borderColor: '#bdbdbd',
              backgroundColor: '#fafafa',
            },
          }}
        >
          Export Report
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: '#757575' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 14,
                borderRadius: 1,
                '& fieldset': { borderColor: '#e0e0e0' },
                '&:hover fieldset': {
                  borderColor: '#b0d1c7',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#b0d1c7',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#b0d1c7',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 14,
                borderRadius: 1,
                '& fieldset': { borderColor: '#e0e0e0' },
                '&:hover fieldset': {
                  borderColor: '#b0d1c7',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#b0d1c7',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#b0d1c7',
              },
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          borderBottom: '1px solid #e0e0e0',
          mb: 3,
          '& .MuiTab-root': {
            color: '#757575',
            fontSize: 14,
            fontWeight: 500,
            textTransform: 'none',
          },
          '& .Mui-selected': {
            color: '#1a1a1a',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#b0d1c7',
          },
        }}
      >
        <Tab label="All Issues" />
        <Tab label="Assigned to Me" />
        <Tab label="Unassigned" />
      </Tabs>

      {/* Issues Grid */}
      <Grid container spacing={2}>
        {filteredIssues.map((issue) => (
          <Grid item xs={12} key={issue.id}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#b0d1c7',
                  backgroundColor: '#fafafa',
                },
                transition: 'all 0.2s',
              }}
              onClick={() => router.push(`/issues/${issue.id.replace('#', '')}`)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#757575', fontSize: 12 }}>
                        #{issue.id.substring(0, 8)}
                      </Typography>
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
                          backgroundColor: '#f0f0f0',
                          color: '#424242',
                          border: '1px solid #e0e0e0',
                          display: 'inline-block',
                          textTransform: 'capitalize',
                        }}
                      >
                        {issue.status.replace('_', ' ')}
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1, fontSize: 16 }}>
                      {issue.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#616161', mb: 2, lineHeight: 1.5 }}>
                      {issue.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 14, color: '#757575' }} />
                        <Typography variant="caption" sx={{ color: '#757575' }}>
                          {issue.location || 'Location not available'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Schedule sx={{ fontSize: 14, color: '#757575' }} />
                        <Typography variant="caption" sx={{ color: '#757575' }}>
                          {formatTimeAgo(issue.created_at)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Person sx={{ fontSize: 14, color: '#757575' }} />
                        <Typography variant="caption" sx={{ color: '#757575' }}>
                          {issue.user_name}
                        </Typography>
                      </Box>
                      {issue.assigned_to && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Avatar sx={{ width: 16, height: 16, backgroundColor: '#e0e0e0', fontSize: 10 }}>
                            A
                          </Avatar>
                          <Typography variant="caption" sx={{ color: '#757575' }}>
                            {issue.assigned_to}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                    {getPriorityIcon(issue.priority)}
                    <IconButton size="small" sx={{ color: '#757575' }}>
                      <MoreVert sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}