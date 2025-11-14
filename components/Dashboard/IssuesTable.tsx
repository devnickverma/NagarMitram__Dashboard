'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search,
  MoreHoriz,
} from '@mui/icons-material';
import AdminApiService from '@/lib/api';
import { newTheme } from '@/lib/theme';

interface Issue {
  id: string;
  title: string;
  category: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'in-progress' | 'resolved';
  assignedTo?: string;
  reportedAt: Date | string;
}

interface IssuesTableProps {
  issues?: Issue[];
  onIssueSelect?: (issue: Issue) => void;
  loading?: boolean;
}

export default function IssuesTable({ issues: propIssues = [], onIssueSelect, loading: propLoading }: IssuesTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Use issues from props directly (already normalized)
  const issues = propIssues;
  const loading = propLoading || false;

  const demoIssues: Issue[] = [
    {
      id: '#1284',
      title: 'Major pothole causing accidents',
      category: 'Road',
      location: { lat: 23.3569, lng: 85.3342 },
      address: 'Kanke Road, Ranchi',
      priority: 'high',
      status: 'new',
      assignedTo: undefined,
      reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '#1283',
      title: 'Water pipe burst',
      category: 'Water',
      location: { lat: 23.3551, lng: 85.3240 },
      address: 'Upper Bazaar, Ranchi',
      priority: 'high',
      status: 'in-progress',
      assignedTo: 'Team A',
      reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      id: '#1282',
      title: 'Traffic signal malfunction',
      category: 'Traffic',
      location: { lat: 23.3608, lng: 85.3330 },
      address: 'Firayalal Chowk, Ranchi',
      priority: 'high',
      status: 'new',
      assignedTo: 'Team B',
      reportedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
    {
      id: '#1281',
      title: 'Garbage overflow near market',
      category: 'Sanitation',
      location: { lat: 23.3441, lng: 85.3096 },
      address: 'Main Road, Ranchi',
      priority: 'medium',
      status: 'new',
      assignedTo: undefined,
      reportedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      id: '#1280',
      title: 'Street light not working',
      category: 'Lighting',
      location: { lat: 23.3695, lng: 85.3270 },
      address: 'HEC Colony, Ranchi',
      priority: 'low',
      status: 'resolved',
      assignedTo: 'Team C',
      reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ];

  const filteredIssues = (issues || []).filter(issue => {
    const location = issue.address || issue.location || '';
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (issue.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatTimeAgo = (date: Date | string | undefined) => {
    if (!date) return 'Recently';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (!dateObj || isNaN(dateObj.getTime())) return 'Recently';

      const hours = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60));
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days === 1) return '1d ago';
      return `${days}d ago`;
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Recent Issues
          </Typography>
          <TextField
            size="small"
            placeholder="Search..."
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
              width: 200,
              '& .MuiOutlinedInput-root': {
                fontSize: 13,
                borderRadius: 1,
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
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
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ 
        flex: 1,
        maxHeight: '350px',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        msOverflowStyle: 'none' as any,
        scrollbarWidth: 'none' as any,
      }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                ID
              </TableCell>
              <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                Issue
              </TableCell>
              <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                Location
              </TableCell>
              <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                Status
              </TableCell>
              <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                Assigned
              </TableCell>
              <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                Time
              </TableCell>
              <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredIssues
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((issue) => (
                <TableRow
                  key={issue.id}
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#fafafa',
                    },
                  }}
                  onClick={() => onIssueSelect?.(issue)}
                >
                  <TableCell sx={{ fontSize: 13, color: '#424242', borderBottom: '1px solid #f0f0f0' }}>
                    {issue.id}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: '#1a1a1a', fontWeight: 500, borderBottom: '1px solid #f0f0f0' }}>
                    {issue.title}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: '#424242', borderBottom: '1px solid #f0f0f0' }}>
                    {issue.address || issue.location || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, borderBottom: '1px solid #f0f0f0' }}>
                    <Box
                      component="span"
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: 0.5,
                        fontSize: 11,
                        fontWeight: 500,
                        backgroundColor: '#f0f0f0',
                        color: '#424242',
                        border: '1px solid #e0e0e0',
                        width: 85,
                        textAlign: 'center',
                        display: 'inline-block',
                        textTransform: 'capitalize',
                      }}
                    >
                      {issue.status}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: '#424242', borderBottom: '1px solid #f0f0f0' }}>
                    {issue.assignedTo || '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: '#757575', borderBottom: '1px solid #f0f0f0' }}>
                    {formatTimeAgo(issue.reportedAt || issue.created_at)}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                    <IconButton size="small" sx={{ color: '#757575' }}>
                      <MoreHoriz sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredIssues.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        sx={{
          borderTop: '1px solid #e0e0e0',
          '.MuiTablePagination-toolbar': {
            minHeight: 48,
          },
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: 13,
            color: '#757575',
          },
        }}
      />
    </Box>
  );
}