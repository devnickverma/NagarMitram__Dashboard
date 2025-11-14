import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface DashboardData {
  stats: {
    totalIssues: number;
    resolvedToday: number;
    inProgress: number;
    criticalIssues: number;
  };
  issues: any[];
  activities: any[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalIssues: 0,
      resolvedToday: 0,
      inProgress: 0,
      criticalIssues: 0,
    },
    issues: [],
    activities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Dashboard: Starting to fetch data...');

      // Fetch all issues from Supabase
      const { data: issues, error: issuesError } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (issuesError) {
        console.error('Dashboard: Error fetching issues:', issuesError);
        throw issuesError;
      }

      console.log('Dashboard: Fetched issues:', issues?.length || 0);

      // Calculate stats from real data
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = {
        totalIssues: issues?.length || 0,
        resolvedToday: issues?.filter(i => 
          i.status === 'resolved' && 
          new Date(i.updated_at) >= today
        ).length || 0,
        inProgress: issues?.filter(i => i.status === 'in_progress').length || 0,
        criticalIssues: issues?.filter(i => i.priority === 'critical').length || 0,
      };

      // Fetch recent activities (comments, status changes, etc.)
      const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Create activity feed from issues and comments
      const activities = [];
      
      // Add recent issue creations as activities
      issues?.slice(0, 5).forEach(issue => {
        activities.push({
          id: `issue-${issue.id}`,
          type: 'issue_created',
          title: 'New Issue Reported',
          description: issue.title,
          time: issue.created_at,
          user: issue.user_name || 'Anonymous',
          icon: 'report',
          color: '#4F46E5',
          issue_id: issue.id
        });
      });

      // Add recent comments as activities
      comments?.forEach(comment => {
        activities.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          title: 'New Comment',
          description: comment.content,
          time: comment.created_at,
          user: comment.user_name,
          icon: 'comment',
          color: '#10B981',
          issue_id: comment.issue_id
        });
      });

      // Sort activities by time
      activities.sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );

      // Normalize issues to extract location fields
      const normalizedIssues = (issues || []).map(issue => {
        // If location is a JSONB object, extract the fields
        if (issue.location && typeof issue.location === 'object') {
          return {
            ...issue,
            latitude: issue.location.latitude,
            longitude: issue.location.longitude,
            address: issue.location.address || 'Unknown location',
            location: issue.location.address || 'Unknown location', // Also set as string for backward compatibility
          };
        }
        return issue;
      });

      setData({
        stats,
        issues: normalizedIssues,
        activities: activities.slice(0, 10), // Keep only 10 most recent
      });

      console.log('Dashboard: Data set successfully');
      setLoading(false);

    } catch (err) {
      console.error('Dashboard: Error fetching dashboard data:', err);
      setError(err);
      setLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    console.log('Dashboard hook: useEffect triggered');

    // Small delay to ensure Supabase is ready
    const initTimer = setTimeout(() => {
      console.log('Dashboard hook: Calling fetchData');
      fetchData();
    }, 100);

    // Subscribe to real-time changes
    const issuesChannelName = 'dashboard-issues';
    const commentsChannelName = 'dashboard-comments';
    const existingIssues = (supabase as any).getChannels?.()?.find((ch: any) => ch?.topic === issuesChannelName);
    if (existingIssues) {
      try { supabase.removeChannel(existingIssues); } catch {}
    }
    const issuesSubscription = supabase
      .channel(issuesChannelName)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'issues' },
        (payload) => {
          console.log('Real-time issue update:', payload);
          fetchData(); // Refetch all data when issues change
        }
      )
      .subscribe();

    const existingComments = (supabase as any).getChannels?.()?.find((ch: any) => ch?.topic === commentsChannelName);
    if (existingComments) {
      try { supabase.removeChannel(existingComments); } catch {}
    }
    const commentsSubscription = supabase
      .channel(commentsChannelName)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          console.log('New comment:', payload);
          fetchData(); // Refetch to include new comment
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      clearTimeout(initTimer);
      supabase.removeChannel(issuesSubscription);
      supabase.removeChannel(commentsSubscription);
    };
  }, []);

  const refetch = () => {
    fetchData();
  };

  return {
    stats: data.stats,
    issues: data.issues,
    activities: data.activities,
    loading,
    error,
    refetch,
  };
}