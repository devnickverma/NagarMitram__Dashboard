'use client';

import { useState, useEffect } from 'react';
import AddUserModal from '@/components/Users/AddUserModal';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Chip,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  MoreVert,
  Delete,
  PersonAdd,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff' | 'citizen';
  status: 'active' | 'inactive';
  issuesReported: number;
  joinedAt: Date;
  location?: string;
  avatar?: string;
}

export default function Users() {
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Get all users from the users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Get issue counts for each user
      const { data: issues, error: issuesError } = await supabase
        .from('issues')
        .select('user_id');

      if (issuesError) throw issuesError;

      // Count issues per user
      const issueCountMap = new Map<string, number>();
      issues?.forEach((issue: any) => {
        const count = issueCountMap.get(issue.user_id) || 0;
        issueCountMap.set(issue.user_id, count + 1);
      });

      // Map users with their issue counts
      const mappedUsers: User[] = usersData?.map((user: any) => ({
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role as 'admin' | 'staff' | 'citizen',
        status: user.status as 'active' | 'inactive',
        issuesReported: issueCountMap.get(user.user_id) || 0,
        joinedAt: new Date(user.created_at),
        location: user.location,
        avatar: user.avatar,
      })) || [];

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#424242';
      case 'staff': return '#616161';
      case 'citizen': return '#757575';
      default: return '#9e9e9e';
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, userId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleRemoveUser = () => {
    if (selectedUserId) {
      setUsers(prev => prev.filter(user => user.id !== selectedUserId));
      toast.success('User removed successfully');
    }
    handleMenuClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
          Users Management ({users.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PersonAdd />}
          onClick={() => setAddUserModalOpen(true)}
          sx={{
            borderColor: '#e0e0e0',
            color: '#424242',
            '&:hover': {
              borderColor: '#bdbdbd',
              backgroundColor: '#fafafa',
            },
          }}
        >
          Add User
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: '#757575', mb: 0.5, fontSize: 12 }}>
                Total Users
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                {users.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: '#757575', mb: 0.5, fontSize: 12 }}>
                Active Users
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                {users.filter(u => u.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: '#757575', mb: 0.5, fontSize: 12 }}>
                Citizens
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                {users.filter(u => u.role === 'citizen').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: '#757575', mb: 0.5, fontSize: 12 }}>
                Staff Members
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                {users.filter(u => u.role === 'staff' || u.role === 'admin').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search users..."
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
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
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="citizen">Citizen</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                  User
                </TableCell>
                <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                  Contact
                </TableCell>
                <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                  Role
                </TableCell>
                <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                  Issues
                </TableCell>
                <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                  Joined
                </TableCell>
                <TableCell sx={{ color: '#757575', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #e0e0e0' }}>
                  
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      '&:hover': { backgroundColor: '#fafafa' },
                    }}
                  >
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: '#e0e0e0',
                            color: '#424242',
                            fontSize: 14,
                          }}
                        >
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a', fontSize: 13 }}>
                            {user.name}
                          </Typography>
                          {user.location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <LocationOn sx={{ fontSize: 12, color: '#757575' }} />
                              <Typography variant="caption" sx={{ color: '#757575', fontSize: 11 }}>
                                {user.location}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Email sx={{ fontSize: 12, color: '#757575' }} />
                          <Typography variant="caption" sx={{ color: '#424242', fontSize: 11 }}>
                            {user.email}
                          </Typography>
                        </Box>
                        {user.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Phone sx={{ fontSize: 12, color: '#757575' }} />
                            <Typography variant="caption" sx={{ color: '#424242', fontSize: 11 }}>
                              {user.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
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
                        {user.role}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
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
                        }}
                      >
                        {user.status}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                      <Typography variant="body2" sx={{ color: '#424242', fontSize: 13 }}>
                        {user.issuesReported}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                      <Typography variant="caption" sx={{ color: '#757575', fontSize: 11 }}>
                        {formatDate(user.joinedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                      <IconButton 
                        size="small" 
                        sx={{ color: '#757575' }}
                        onClick={(e) => handleMenuClick(e, user.id)}
                      >
                        <MoreVert sx={{ fontSize: 18 }} />
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
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            borderTop: '1px solid #e0e0e0',
            '.MuiTablePagination-toolbar': { minHeight: 48 },
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontSize: 13,
              color: '#757575',
            },
          }}
        />
      </Card>

      {/* User Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }
        }}
      >
        <MenuItem 
          onClick={handleRemoveUser}
          sx={{ 
            color: '#f44336',
            fontSize: 14,
            '&:hover': {
              backgroundColor: '#ffebee',
            }
          }}
        >
          <Delete sx={{ fontSize: 16, mr: 1 }} />
          Remove User
        </MenuItem>
      </Menu>

      {/* Add User Modal */}
      <AddUserModal
        open={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        onUserAdded={(newUser) => {
          setUsers(prev => [...prev, newUser]);
        }}
      />
    </Box>
  );
}