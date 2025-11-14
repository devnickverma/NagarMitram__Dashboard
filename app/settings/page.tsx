'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Save,
  Edit,
  Delete,
  Add,
  Notifications,
  Security,
  Language,
  Palette,
  Storage,
} from '@mui/icons-material';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyReports: true,
  });

  const [profile, setProfile] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@jharkhandgov.in',
    phone: '+91 98765-43210',
    department: 'Municipal Administration',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        email: user.email,
        phone: '+91 98765-43210',
        department: 'Municipal Administration',
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    updateUser({
      name: profile.name,
      email: profile.email,
    });
    // You could add a toast notification here
    console.log('Profile updated successfully');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 3 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: '#e0e0e0',
                    color: '#424242',
                  }}
                >
                  AU
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                    Profile Settings
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#757575', fontSize: 12 }}>
                    Manage your account information
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#757575', mb: 1, fontSize: 12 }}>
                    Full Name
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
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
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#757575', mb: 1, fontSize: 12 }}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
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
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#757575', mb: 1, fontSize: 12 }}>
                    Phone Number
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
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
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#757575', mb: 1, fontSize: 12 }}>
                    Department
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={profile.department}
                    onChange={(e) => setProfile({...profile, department: e.target.value})}
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
              </Grid>

              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  sx={{
                    borderColor: '#e0e0e0',
                    color: '#424242',
                    '&:hover': {
                      borderColor: '#bdbdbd',
                      backgroundColor: '#fafafa',
                    },
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Notifications sx={{ color: '#424242' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                    Notifications
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#757575', fontSize: 12 }}>
                    Choose how you want to be notified
                  </Typography>
                </Box>
              </Box>

              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Email Alerts"
                    secondary="Receive notifications via email"
                    primaryTypographyProps={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}
                    secondaryTypographyProps={{ fontSize: 11, color: '#757575' }}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.emailAlerts}
                      onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#b0d1c7',
                          '&:hover': {
                            backgroundColor: 'rgba(176, 209, 199, 0.08)',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#b0d1c7',
                        },
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="SMS Alerts"
                    secondary="Receive critical alerts via SMS"
                    primaryTypographyProps={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}
                    secondaryTypographyProps={{ fontSize: 11, color: '#757575' }}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.smsAlerts}
                      onChange={(e) => setNotifications({...notifications, smsAlerts: e.target.checked})}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#b0d1c7',
                          '&:hover': {
                            backgroundColor: 'rgba(176, 209, 199, 0.08)',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#b0d1c7',
                        },
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Browser push notifications"
                    primaryTypographyProps={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}
                    secondaryTypographyProps={{ fontSize: 11, color: '#757575' }}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.pushNotifications}
                      onChange={(e) => setNotifications({...notifications, pushNotifications: e.target.checked})}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#b0d1c7',
                          '&:hover': {
                            backgroundColor: 'rgba(176, 209, 199, 0.08)',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#b0d1c7',
                        },
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Weekly Reports"
                    secondary="Receive weekly summary reports"
                    primaryTypographyProps={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}
                    secondaryTypographyProps={{ fontSize: 11, color: '#757575' }}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.weeklyReports}
                      onChange={(e) => setNotifications({...notifications, weeklyReports: e.target.checked})}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#b0d1c7',
                          '&:hover': {
                            backgroundColor: 'rgba(176, 209, 199, 0.08)',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#b0d1c7',
                        },
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 3 }}>
                System Settings
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Security sx={{ color: '#424242', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                        Security
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#757575', mb: 2, display: 'block' }}>
                      Manage security settings and permissions
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: '#e0e0e0',
                        color: '#424242',
                        fontSize: 12,
                        '&:hover': {
                          borderColor: '#bdbdbd',
                          backgroundColor: '#fafafa',
                        },
                      }}
                    >
                      Configure
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Language sx={{ color: '#424242', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                        Localization
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#757575', mb: 2, display: 'block' }}>
                      Language and region settings
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: '#e0e0e0',
                        color: '#424242',
                        fontSize: 12,
                        '&:hover': {
                          borderColor: '#bdbdbd',
                          backgroundColor: '#fafafa',
                        },
                      }}
                    >
                      Configure
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Storage sx={{ color: '#424242', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                        Data Management
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#757575', mb: 2, display: 'block' }}>
                      Backup and data retention settings
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: '#e0e0e0',
                        color: '#424242',
                        fontSize: 12,
                        '&:hover': {
                          borderColor: '#bdbdbd',
                          backgroundColor: '#fafafa',
                        },
                      }}
                    >
                      Configure
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Palette sx={{ color: '#424242', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                        Interface
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#757575', mb: 2, display: 'block' }}>
                      Customize the admin panel interface
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: '#e0e0e0',
                        color: '#424242',
                        fontSize: 12,
                        '&:hover': {
                          borderColor: '#bdbdbd',
                          backgroundColor: '#fafafa',
                        },
                      }}
                    >
                      Configure
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}