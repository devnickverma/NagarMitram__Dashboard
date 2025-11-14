'use client';

import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AdminApiService from '@/lib/api';
import { newTheme } from '@/lib/theme';

interface StatsGridProps {
  stats?: {
    totalIssues: number;
    resolvedToday: number;
    inProgress: number;
    criticalIssues: number;
  };
  loading?: boolean;
}

interface ChartData {
  name: string;
  value: number;
}

export default function StatsGrid({ stats: propStats, loading: propLoading }: StatsGridProps) {
  const [stats, setStats] = useState(propStats);
  const [loading, setLoading] = useState(propLoading || false);

  useEffect(() => {
    if (propStats) {
      setStats(propStats);
    } else {
      loadStats();
    }
  }, [propStats]);

  useEffect(() => {
    setLoading(propLoading || false);
  }, [propLoading]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await AdminApiService.getStats();
      setStats({
        totalIssues: data.totalIssues || 0,
        resolvedToday: data.resolvedThisWeek || 0,
        inProgress: data.inProgressIssues || 0,
        criticalIssues: data.newIssues || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };
  const statCards = [
    {
      title: 'Total Issues',
      value: stats?.totalIssues || 0,
      change: 12,
      changeLabel: 'vs last week',
      chartData: [
        { name: 'Mon', value: Math.max(0, (stats?.totalIssues || 0) - 6) },
        { name: 'Tue', value: Math.max(0, (stats?.totalIssues || 0) - 5) },
        { name: 'Wed', value: Math.max(0, (stats?.totalIssues || 0) - 4) },
        { name: 'Thu', value: Math.max(0, (stats?.totalIssues || 0) - 3) },
        { name: 'Fri', value: Math.max(0, (stats?.totalIssues || 0) - 2) },
        { name: 'Sat', value: Math.max(0, (stats?.totalIssues || 0) - 1) },
        { name: 'Sun', value: stats?.totalIssues || 0 },
      ],
    },
    {
      title: 'Resolved Today',
      value: stats?.resolvedToday || 0,
      change: 8,
      changeLabel: 'vs yesterday',
      chartData: [
        { name: 'Mon', value: 0 },
        { name: 'Tue', value: 0 },
        { name: 'Wed', value: 0 },
        { name: 'Thu', value: 0 },
        { name: 'Fri', value: 0 },
        { name: 'Sat', value: 0 },
        { name: 'Sun', value: stats?.resolvedToday || 0 },
      ],
    },
    {
      title: 'In Progress',
      value: stats?.inProgress || 0,
      change: -3,
      changeLabel: 'vs last week',
      chartData: [
        { name: 'Mon', value: Math.max(0, (stats?.inProgress || 0) - 1) },
        { name: 'Tue', value: Math.max(0, (stats?.inProgress || 0) + 1) },
        { name: 'Wed', value: Math.max(0, (stats?.inProgress || 0) - 2) },
        { name: 'Thu', value: Math.max(0, (stats?.inProgress || 0)) },
        { name: 'Fri', value: Math.max(0, (stats?.inProgress || 0) - 1) },
        { name: 'Sat', value: Math.max(0, (stats?.inProgress || 0) - 1) },
        { name: 'Sun', value: stats?.inProgress || 0 },
      ],
    },
    {
      title: 'Critical',
      value: stats?.criticalIssues || 0,
      change: 5,
      changeLabel: 'vs last week',
      chartData: [
        { name: 'Mon', value: 0 },
        { name: 'Tue', value: 0 },
        { name: 'Wed', value: 0 },
        { name: 'Thu', value: 0 },
        { name: 'Fri', value: 0 },
        { name: 'Sat', value: 0 },
        { name: 'Sun', value: stats?.criticalIssues || 0 },
      ],
    },
  ];

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={36} />
                <Skeleton variant="text" width="80%" height={16} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={6} lg={3} key={stat.title}>
          <Card 
            elevation={0} 
            sx={{ 
              background: 'linear-gradient(135deg, ' + newTheme.colors.primary + ' 0%, ' + newTheme.colors.primary + '80 100%)',
              borderRadius: 3,
              height: 140,
              color: '#ffffff',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: newTheme.shadows.lg,
              },
              transition: 'all 0.3s ease',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: 500,
                      mb: 0.5,
                      fontSize: 13,
                    }}
                  >
                    {stat.title}
                  </Typography>
                  
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#ffffff',
                      mb: 0.5,
                    }}
                  >
                    {stat.value.toLocaleString()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stat.change > 0 ? (
                      <TrendingUp sx={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }} />
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: 500,
                        fontSize: 11,
                      }}
                    >
                      {Math.abs(stat.change)}% {stat.changeLabel}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ width: 100, height: 50 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stat.chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                        {stat.chartData.map((entry, idx) => (
                          <Cell 
                            key={`cell-${idx}`} 
                            fill={idx === stat.chartData.length - 1 ? '#ffffff' : 'rgba(255,255,255,0.3)'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}