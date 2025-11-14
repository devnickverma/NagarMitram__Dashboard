'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Close,
  Person,
  Email,
  Phone,
  LocationOn,
  Badge,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserAdded?: (user: any) => void;
}

export default function AddUserModal({ open, onClose, onUserAdded }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
        issuesReported: 0,
        joinedAt: new Date(),
      };

      onUserAdded?.(newUser);
      toast.success('User added successfully!');
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        location: '',
      });
    } catch (error) {
      toast.error('Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      location: '',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 500,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
          Add New User
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Name */}
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              InputProps={{
                startAdornment: <Person sx={{ color: '#757575', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
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

            {/* Email */}
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              InputProps={{
                startAdornment: <Email sx={{ color: '#757575', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
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

            {/* Phone */}
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              InputProps={{
                startAdornment: <Phone sx={{ color: '#757575', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
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

            {/* Role */}
            <FormControl fullWidth required>
              <InputLabel sx={{ '&.Mui-focused': { color: '#b0d1c7' } }}>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => handleInputChange('role', e.target.value)}
                startAdornment={<Badge sx={{ color: '#757575', mr: 1 }} />}
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#b0d1c7',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#b0d1c7',
                  },
                }}
              >
                <MenuItem value="Admin">Administrator</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Staff">Staff Member</MenuItem>
                <MenuItem value="Viewer">Viewer</MenuItem>
              </Select>
            </FormControl>

            {/* Department */}
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
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

            {/* Location */}
            <TextField
              fullWidth
              label="Location (Optional)"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              InputProps={{
                startAdornment: <LocationOn sx={{ color: '#757575', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
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
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #f0f0f0' }}>
          <Button
            onClick={handleClose}
            sx={{ 
              color: '#757575',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.name || !formData.email || !formData.role}
            sx={{
              backgroundColor: '#b0d1c7',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                backgroundColor: '#96c5b5',
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0',
                color: '#9e9e9e',
              },
            }}
          >
            {loading ? 'Adding User...' : 'Add User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}