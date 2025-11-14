'use client';

import { useState, useEffect } from 'react';
import { Grid, Box, Container, Paper, Typography } from '@mui/material';
import StatsGrid from '@/components/Dashboard/StatsGrid';
import IssueMap from '@/components/Map/IssueMap';
import IssuesTable from '@/components/Dashboard/IssuesTable';
import PriorityQueue from '@/components/Dashboard/PriorityQueue';
import ActivityFeed from '@/components/Dashboard/ActivityFeed';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { useRealtimeIssues } from '@/lib/hooks/useRealtimeIssues';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const { stats, issues, activities, loading, error, refetch } = useDashboardData();

  // Subscribe to real-time issue updates
  useRealtimeIssues((evt) => {
    if (evt?.eventType === 'INSERT') {
      toast('New issue reported!', { icon: '🔔' });
    }
    refetch();
  });

  // WebSocket-based messaging removed to avoid duplicate realtime sources

  const handleIssueSelect = (issue: any) => {
    setSelectedIssue(issue);
  };


  return (
    <ProtectedRoute>
      <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Simple Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>
            Overview of civic issues and management metrics
          </Typography>
        </Box>

        {/* Stats */}
        <Box sx={{ mb: 3 }}>
          <StatsGrid stats={stats} loading={loading} />
        </Box>

        {/* Main Content Area */}
        <Grid container spacing={3}>
          {/* Top Row - Recent Issues and Priority Queue */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0} 
              sx={{ 
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                overflow: 'hidden',
                height: 450,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <IssuesTable 
                issues={issues}
                onIssueSelect={handleIssueSelect}
                loading={loading}
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                overflow: 'hidden',
                height: 450
              }}
            >
              <PriorityQueue 
                issues={issues?.filter(i => i.priority === 'high')}
                onIssueSelect={handleIssueSelect}
              />
            </Paper>
          </Grid>

          {/* Second Row - Recent Activity and Map */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                overflow: 'hidden',
                height: 450
              }}
            >
              <ActivityFeed activities={activities} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0} 
              sx={{ 
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                overflow: 'hidden',
                height: 450
              }}
            >
              <IssueMap 
                issues={issues}
                onIssueSelect={handleIssueSelect}
                selectedIssue={selectedIssue}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}