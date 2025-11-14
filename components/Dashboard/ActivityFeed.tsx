'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  CheckCircle,
  Assignment,
  Person,
  Warning,
  Build,
} from '@mui/icons-material';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time?: string;
  timestamp?: Date | string;
  user?: string;
  icon?: string | React.ReactNode;
  color?: string | 'success' | 'warning' | 'info' | 'error';
  issue_id?: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
}

export default function ActivityFeed({ activities = []}: ActivityFeedProps) {
  const router = useRouter();
  const displayActivities = activities;

  const handleActivityClick = (activity: Activity) => {
    // Extract issue ID from activity.id or use issue_id if available
    let issueId = activity.issue_id;

    // If activity.id is in format "issue-{id}", extract the id
    if (!issueId && activity.id.startsWith('issue-')) {
      issueId = activity.id.replace('issue-', '');
    }

    // Navigate to issue details if we have an ID
    if (issueId) {
      router.push(`/issues/${issueId}`);
    }
  };

  // Get icon based on icon string or return the ReactNode
  const getIcon = (iconProp?: string | React.ReactNode) => {
    if (!iconProp) return null;
    if (typeof iconProp !== 'string') return iconProp;

    switch (iconProp) {
      case 'report':
        return <Assignment sx={{ fontSize: 14 }} />;
      case 'comment':
        return <Warning sx={{ fontSize: 14 }} />;
      case 'check':
        return <CheckCircle sx={{ fontSize: 14 }} />;
      case 'person':
        return <Person sx={{ fontSize: 14 }} />;
      case 'build':
        return <Build sx={{ fontSize: 14 }} />;
      default:
        return <Assignment sx={{ fontSize: 14 }} />;
    }
  };

  // Get color - convert hex to MaterialUI color names
  const getColor = (colorProp?: string) => {
    if (!colorProp) return '#b0d1c7';
    if (colorProp.startsWith('#')) return colorProp;

    switch (colorProp) {
      case 'success':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'error':
        return '#f44336';
      case 'info':
        return '#b0d1c7';
      default:
        return colorProp;
    }
  };

  const formatTime = (date: Date | string | undefined) => {
    // Handle undefined/null
    if (!date) return 'Recently';

    // If it's already a formatted string, return it
    if (typeof date === 'string' && date.includes('ago')) {
      return date;
    }

    try {
      // Otherwise, format the date
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (!dateObj || isNaN(dateObj.getTime())) return 'Recently';

      const minutes = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60));
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
        Recent Activity
      </Typography>

      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        msOverflowStyle: 'none' as any,
        scrollbarWidth: 'none' as any,
      }}>
        {displayActivities.map((activity, index) => (
          <Box
            key={activity.id}
            sx={{
              display: 'flex',
              mb: 3,
              alignItems: 'flex-start',
              cursor: 'pointer',
              borderRadius: 1,
              p: 1,
              ml: -1,
              mr: -1,
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: '#fafafa',
              },
            }}
            onClick={() => handleActivityClick(activity)}
          >
            {/* Left side - Dot and Line */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: `2px solid ${getColor(activity.color)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  color: getColor(activity.color),
                  '& svg': {
                    fontSize: 14
                  }
                }}
              >
                {getIcon(activity.icon)}
              </Box>
              {index < displayActivities.length - 1 && (
                <Box
                  sx={{
                    width: 2,
                    height: 40,
                    backgroundColor: '#e0e0e0',
                    mt: 1
                  }}
                />
              )}
            </Box>
            
            {/* Right side - Content */}
            <Box sx={{ flex: 1, pt: -0.1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  color: '#1a1a1a',
                  mb: 0.5,
                  fontSize: 14,
                }}
              >
                {activity.title}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#757575',
                  fontSize: 13,
                  lineHeight: 1.4,
                  mb: 0.5,
                }}
              >
                {activity.description}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#9e9e9e',
                  fontSize: 12,
                }}
              >
                {formatTime(activity.time || activity.timestamp)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}