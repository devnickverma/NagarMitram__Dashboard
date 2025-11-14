'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  InputBase,
  alpha,
  styled,
  Popover,
  Paper,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  People,
  Analytics,
  Settings,
  Notifications,
  CheckCircle,
  Warning,
  Info,
  Search as SearchIcon,
  Logout,
  Person,
  Circle,
  Description,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import { notificationService, Notification } from '@/lib/services/notificationService';

const drawerWidth = 240;

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 8,
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
  marginLeft: theme.spacing(2),
  width: '320px',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#757575',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    fontSize: 14,
  },
}));

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Helper function to get user initials
const getUserInitials = (user: any): string => {
  if (!user) return 'U';

  // Try from displayName (Firebase) or name
  const name = user.displayName || user.name;
  if (name) {
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Try from email
  if (user.email) {
    const emailName = user.email.split('@')[0];
    if (emailName.length >= 2) {
      return emailName.substring(0, 2).toUpperCase();
    }
    return emailName.charAt(0).toUpperCase() + 'U';
  }

  return 'U';
};

// Helper function to get icon for notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'issue_status':
      return <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />;
    case 'assignment':
      return <Info sx={{ color: '#b0d1c7', fontSize: 20 }} />;
    case 'comment':
      return <Info sx={{ color: '#2196f3', fontSize: 20 }} />;
    case 'system':
      return <Warning sx={{ color: '#ff9800', fontSize: 20 }} />;
    default:
      return <Info sx={{ color: '#b0d1c7', fontSize: 20 }} />;
  }
};

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [profileHoverTimeout, setProfileHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { logout, user } = useAuth();

  // Load notifications on mount
  useEffect(() => {
    if (user?.uid) {
      loadNotifications();
      loadUnreadCount();

      // Subscribe to real-time notifications
      const subscription = notificationService.subscribeToNotifications(
        user.uid,
        (newNotification) => {
          setNotifications((prev) => [newNotification, ...prev]);
          setNotificationCount((prev) => prev + 1);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user?.uid) return;
    const data = await notificationService.getNotifications(user.uid, 10);
    setNotifications(data);
  };

  const loadUnreadCount = async () => {
    if (!user?.uid) return;
    const count = await notificationService.getUnreadCount(user.uid);
    setNotificationCount(count);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;
    await notificationService.markAllAsRead(user.uid);
    setNotificationCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const notificationOpen = Boolean(notificationAnchorEl);
  const profileOpen = Boolean(profileAnchorEl);

  const handleProfileMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMouseLeave = () => {
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard sx={{ fontSize: 20 }} />, path: '/dashboard' },
    { text: 'Issues', icon: <Assignment sx={{ fontSize: 20 }} />, path: '/issues' },
    { text: 'Users', icon: <People sx={{ fontSize: 20 }} />, path: '/users' },
    { text: 'Analytics', icon: <Analytics sx={{ fontSize: 20 }} />, path: '/analytics' },
    { text: 'Reports', icon: <Description sx={{ fontSize: 20 }} />, path: '/reports' },
    { text: 'Settings', icon: <Settings sx={{ fontSize: 20 }} />, path: '/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', backgroundColor: '#212121' }}>
      {/* Logo */}
      <Box sx={{ 
        p: 2.5,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: '-0.5px'
          }}
        >
          NagarMitram
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Issue Management System
        </Typography>
      </Box>
      
      {/* Navigation */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.path}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#ffffff', minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: '#ffffff'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#ffffff' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar sx={{ height: 64 }}>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: '#424242' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Actions */}
          <IconButton
            sx={{ color: '#757575' }}
            onClick={handleNotificationClick}
          >
            <Badge badgeContent={notificationCount} color="error" max={99}>
              <Notifications sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>
          
          <Box 
            sx={{ ml: 2, display: 'flex', alignItems: 'center' }}
            onMouseEnter={handleProfileMouseEnter}
            onMouseLeave={handleProfileMouseLeave}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#e0e0e0',
                color: '#757575',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#d0d0d0',
                }
              }}
            >
              {getUserInitials(user)}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification Dropdown */}
      <Popover
        open={notificationOpen}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        disableScrollLock={true}
        sx={{
          '& .MuiPopover-paper': {
            marginTop: 1,
          }
        }}
      >
        <Paper sx={{ 
          width: 320, 
          maxHeight: 420,
          overflow: 'hidden',
          '& .MuiList-root': {
            maxHeight: 350,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: 4,
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#d0d0d0',
              borderRadius: 2,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#b0b0b0',
            },
          }
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
              Notifications
            </Typography>
            {notificationCount > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{
                  fontSize: 11,
                  textTransform: 'none',
                  color: '#b0d1c7',
                  '&:hover': {
                    backgroundColor: 'rgba(176, 209, 199, 0.1)',
                  },
                }}
              >
                Mark all as read
              </Button>
            )}
          </Box>
          <List sx={{ p: 0 }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#757575' }}>
                  No notifications yet
                </Typography>
              </Box>
            ) : (
              notifications.map((notification, index) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    p: 2,
                    borderBottom: index < notifications.length - 1 ? '1px solid #f5f5f5' : 'none',
                    alignItems: 'flex-start',
                    minHeight: 80,
                    backgroundColor: notification.read ? 'transparent' : 'rgba(176, 209, 199, 0.05)',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: notification.read ? '#fafafa' : 'rgba(176, 209, 199, 0.1)',
                    },
                  }}
                  onClick={async () => {
                    if (!notification.read) {
                      await notificationService.markAsRead(notification.id);
                      setNotifications((prev) =>
                        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
                      );
                      setNotificationCount((prev) => Math.max(0, prev - 1));
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600, mb: 0.5, color: '#1a1a1a' }}>
                      {notification.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#757575', lineHeight: 1.3, display: 'block', mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9e9e9e', fontSize: 11 }}>
                      {formatTimeAgo(notification.created_at)}
                    </Typography>
                  </Box>
                  {!notification.read && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#b0d1c7', ml: 1, mt: 1 }} />
                  )}
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      </Popover>

      {/* Profile Hover Card */}
      <Popover
        open={profileOpen}
        anchorEl={profileAnchorEl}
        onClose={() => setProfileAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        disableScrollLock={true}
        sx={{
          '& .MuiPopover-paper': {
            marginTop: 1,
          }
        }}
      >
        <Paper 
          sx={{ 
            width: 240, 
            p: 2,
            border: '1px solid #e0e0e0',
            backgroundColor: 'white'
          }}
          onMouseLeave={() => setProfileAnchorEl(null)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#b0d1c7',
                color: 'white',
                fontSize: 16,
                fontWeight: 600,
                mr: 2
              }}
            >
              {getUserInitials(user)}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#757575' }}>
                {user?.role || 'Administrator'}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ mt: 1 }}>
            <Button
              fullWidth
              size="small"
              startIcon={<Logout sx={{ fontSize: 16 }} />}
              onClick={logout}
              sx={{
                color: '#757575',
                fontSize: 12,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  color: '#1a1a1a',
                },
              }}
            >
              Sign Out
            </Button>
          </Box>
        </Paper>
      </Popover>
      
      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid #e0e0e0',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#fafafa',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}