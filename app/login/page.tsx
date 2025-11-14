'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  PersonAdd,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, signup, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const success = await login(email, password);
        if (success) {
          toast.success('Login successful!');
          router.push('/dashboard');
        } else {
          setError('Invalid email or password');
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const success = await signup(email, password, name);
        if (success) {
          toast.success('Account created successfully!');
          router.push('/dashboard');
        } else {
          setError('Signup failed. Please try again.');
        }
      } else if (mode === 'forgot') {
        await resetPassword(email);
        toast.success('Password reset email sent!');
        setMode('login');
      }
    } catch (error: any) {
      if (error?.message?.includes('already in use')) {
        setError('This email is already registered');
      } else if (error?.message?.includes('invalid-email')) {
        setError('Invalid email address');
      } else {
        setError(mode === 'login' ? 'Login failed' : mode === 'signup' ? 'Signup failed' : 'Failed to send reset email');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'content-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ mb: 2 }}>
              <AdminPanelSettings 
                sx={{ 
                  fontSize: 48, 
                  color: '#b0d1c7',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }} 
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
              NagarMitra Admin
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              {mode === 'login' ? 'Sign in to your account' : mode === 'signup' ? 'Create a new account' : 'Reset your password'}
            </Typography>
          </Box>

          {/* Auth Form */}
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonAdd sx={{ color: '#757575' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
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
            )}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#757575' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
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

            {mode !== 'forgot' && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#757575' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
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
            )}

            {mode === 'signup' && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#757575' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
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
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #b0d1c7 0%, #96c5b5 100%)',
                fontWeight: 600,
                fontSize: 16,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(176, 209, 199, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #96c5b5 0%, #7eb8a3 100%)',
                  boxShadow: '0 6px 16px rgba(176, 209, 199, 0.4)',
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e',
                },
              }}
            >
              {loading ? (
                mode === 'login' ? 'Signing in...' : 
                mode === 'signup' ? 'Creating account...' : 
                'Sending reset email...'
              ) : (
                mode === 'login' ? 'Sign In' : 
                mode === 'signup' ? 'Create Account' : 
                'Send Reset Email'
              )}
            </Button>
          </form>

          {/* Links */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            {mode === 'login' && (
              <>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  sx={{ 
                    color: '#b0d1c7',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Don't have an account? Sign Up
                </Link>
                <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
                  <Link
                    component="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                    }}
                    sx={{ 
                      color: '#757575',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Typography>
              </>
            )}
            {mode === 'signup' && (
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                sx={{ 
                  color: '#b0d1c7',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Already have an account? Sign In
              </Link>
            )}
            {mode === 'forgot' && (
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                sx={{ 
                  color: '#b0d1c7',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Back to Sign In
              </Link>
            )}
          </Box>

          {/* Demo Credentials - Only show on login */}
          {mode === 'login' && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#757575', display: 'block', textAlign: 'center' }}>
                Demo Credentials:
              </Typography>
              <Typography variant="caption" sx={{ color: '#1a1a1a', display: 'block', textAlign: 'center', mt: 0.5 }}>
                Email: <strong>admin@civic.com</strong> • Password: <strong>admin123</strong>
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}