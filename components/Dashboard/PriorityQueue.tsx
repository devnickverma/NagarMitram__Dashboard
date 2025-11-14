'use client';

import {
  Box,
  Typography,
  List,
  ListItem,
} from '@mui/material';

interface PriorityQueueProps {
  issues?: any[];
  onIssueSelect?: (issue: any) => void;
}

export default function PriorityQueue({ issues = [], onIssueSelect }: PriorityQueueProps) {
  const displayIssues = issues;

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
        Priority Queue
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
        <List sx={{ p: 0 }}>
        {displayIssues.slice(0, 5).map((issue) => (
          <ListItem
            key={issue.id}
            sx={{
              p: 1.5,
              mb: 1,
              backgroundColor: '#fafafa',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
            onClick={() => onIssueSelect?.(issue)}
          >
            <Box sx={{ width: '100%' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: '#1a1a1a',
                  mb: 0.5,
                  fontSize: 13,
                }}
              >
                {issue.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#757575',
                  fontSize: 12,
                }}
              >
                {issue.address || issue.location || 'N/A'}
              </Typography>
            </Box>
          </ListItem>
        ))}
        </List>
      </Box>
    </Box>
  );
}