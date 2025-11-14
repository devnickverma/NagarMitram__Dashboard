'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Skeleton } from '@mui/material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [resolutionData, setResolutionData] = useState<any[]>([]);
  const [priorityData, setPriorityData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('analytics-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'issues' },
        () => {
          fetchAnalyticsData(); // Refetch when data changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all issues
      const { data: issues } = await supabase
        .from('issues')
        .select('*');

      if (issues) {
        // Process weekly data (last 7 days)
        const weekData = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dayName = days[date.getDay()];
          
          const dayIssues = issues.filter(issue => {
            const issueDate = new Date(issue.created_at);
            return issueDate.toDateString() === date.toDateString();
          });
          
          const resolvedIssues = dayIssues.filter(i => i.status === 'resolved');
          
          weekData.push({
            name: dayName,
            issues: dayIssues.length,
            resolved: resolvedIssues.length
          });
        }
        setWeeklyData(weekData);

        // Process category data
        const categories: { [key: string]: number } = {};
        issues.forEach(issue => {
          categories[issue.category] = (categories[issue.category] || 0) + 1;
        });
        
        const categoryColors = ['#424242', '#616161', '#757575', '#9e9e9e', '#bdbdbd'];
        const catData = Object.entries(categories).map(([name, value], index) => ({
          name,
          value,
          color: categoryColors[index % categoryColors.length]
        }));
        setCategoryData(catData);

        // Process priority data
        const priorities: { [key: string]: number } = {};
        issues.forEach(issue => {
          priorities[issue.priority] = (priorities[issue.priority] || 0) + 1;
        });
        
        const priorityColors = {
          critical: '#DC2626',
          high: '#EA580C',
          medium: '#F59E0B',
          low: '#10B981'
        };
        
        const priData = Object.entries(priorities).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: priorityColors[name as keyof typeof priorityColors] || '#6B7280'
        }));
        setPriorityData(priData);

        // Process resolution time data (last 6 months)
        const monthData = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = months[date.getMonth()];
          
          const monthIssues = issues.filter(issue => {
            const issueDate = new Date(issue.created_at);
            return issueDate.getMonth() === date.getMonth() && 
                   issueDate.getFullYear() === date.getFullYear();
          });
          
          const resolvedMonthIssues = monthIssues.filter(i => i.status === 'resolved');
          const avgTime = resolvedMonthIssues.length > 0 ? 
            resolvedMonthIssues.reduce((acc, issue) => {
              if (issue.resolved_at) {
                const created = new Date(issue.created_at).getTime();
                const resolved = new Date(issue.resolved_at).getTime();
                return acc + (resolved - created) / (1000 * 60 * 60 * 24); // Days
              }
              return acc;
            }, 0) / resolvedMonthIssues.length : 0;
          
          monthData.push({
            name: monthName,
            time: parseFloat(avgTime.toFixed(1))
          });
        }
        setResolutionData(monthData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 3 }}>
        Analytics
      </Typography>

      <Grid container spacing={3}>
            {/* Issues Over Time */}
            <Grid item xs={12} lg={8}>
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                    Issues Over Time (Last 7 Days)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    {loading ? (
                      <Skeleton variant="rectangular" height={300} />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#9e9e9e" fontSize={12} />
                          <YAxis stroke="#9e9e9e" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#ffffff', 
                              border: '1px solid #e0e0e0',
                              borderRadius: 4 
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="issues" 
                            stroke="#424242" 
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#424242' }}
                            name="Reported"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="resolved" 
                            stroke="#10B981" 
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#10B981' }}
                            name="Resolved"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Category Distribution */}
            <Grid item xs={12} lg={4}>
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                    Category Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    {loading ? (
                      <Skeleton variant="rectangular" height={300} />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                  {!loading && (
                    <Box sx={{ mt: 2 }}>
                      {categoryData.map((cat, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            bgcolor: cat.color, 
                            borderRadius: '2px',
                            mr: 1 
                          }} />
                          <Typography variant="caption" sx={{ color: '#757575' }}>
                            {cat.name}: {cat.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Resolution Time Trend */}
            <Grid item xs={12} lg={6}>
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                    Average Resolution Time (Days)
                  </Typography>
                  <Box sx={{ height: 250 }}>
                    {loading ? (
                      <Skeleton variant="rectangular" height={250} />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={resolutionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#9e9e9e" fontSize={12} />
                          <YAxis stroke="#9e9e9e" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#ffffff', 
                              border: '1px solid #e0e0e0',
                              borderRadius: 4 
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="time" 
                            stroke="#616161" 
                            fill="#e0e0e0" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Priority Breakdown */}
            <Grid item xs={12} lg={6}>
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                    Priority Breakdown
                  </Typography>
                  <Box sx={{ height: 250 }}>
                    {loading ? (
                      <Skeleton variant="rectangular" height={250} />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={priorityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#9e9e9e" fontSize={12} />
                          <YAxis stroke="#9e9e9e" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#ffffff', 
                              border: '1px solid #e0e0e0',
                              borderRadius: 4 
                            }} 
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {priorityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
    </Box>
  );
}