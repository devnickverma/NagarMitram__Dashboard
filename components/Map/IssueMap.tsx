'use client';

import dynamic from 'next/dynamic';
import { Box, Typography } from '@mui/material';

// Dynamic import the simple map to avoid SSR issues
const SimpleMap = dynamic(
  () => import('../ui/SimpleMap').then(mod => mod.SimpleMap),
  { 
    ssr: false,
    loading: () => (
      <Box 
        sx={{ 
          height: '100%', 
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
        }}
      >
        <Typography variant="body2" sx={{ color: '#757575' }}>
          Loading map...
        </Typography>
      </Box>
    )
  }
);

interface Issue {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  location?: {
    lat: number;
    lng: number;
  };
  address?: string;
}

interface IssueMapProps {
  issues?: Issue[];
  onIssueSelect?: (issue: Issue) => void;
  selectedIssue?: Issue | null;
}

export default function IssueMap({ issues = [], onIssueSelect, selectedIssue }: IssueMapProps) {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <SimpleMap 
        issues={issues}
        onIssueClick={onIssueSelect}
        height="100%"
      />
    </Box>
  );
}