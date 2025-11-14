'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after a brief moment
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#fafafa',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#424242' }} size={40} />
        <Box sx={{ mt: 2, fontSize: 16, fontWeight: 500, color: '#424242' }}>
          Loading Admin Panel...
        </Box>
      </Box>
    </Box>
  );
}