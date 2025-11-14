'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (data: { name?: string; email?: string }) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      if (user) {
        toast.success('Login successful!');
        router.push('/dashboard');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      if (user) {
        // Store user data in Supabase (optional - for user profiles)
        try {
          const { supabase } = await import('@/lib/supabase');
          await supabase.from('users').insert({
            uid: user.uid,
            email: user.email,
            display_name: name,
            role: 'admin',
            created_at: new Date().toISOString()
          });
        } catch (dbError) {
          console.log('User profile creation error (non-critical):', dbError);
        }
        toast.success('Account created successfully!');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Signup failed');
      return false;
    }
  };

  const logout = () => {
    signOut(auth).then(() => {
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    }).catch((error) => {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    });
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
      throw error;
    }
  };

  const updateUser = async (data: { name?: string; email?: string }) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user logged in');
      }

      // Update display name in Firebase
      if (data.name) {
        await updateProfile(auth.currentUser, {
          displayName: data.name,
        });
      }

      // Refresh user object to get updated data
      await auth.currentUser.reload();

      // Force a new object to trigger React re-render
      const updatedUser = auth.currentUser;
      setUser({
        uid: updatedUser.uid,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        photoURL: updatedUser.photoURL,
        emailVerified: updatedUser.emailVerified,
        metadata: updatedUser.metadata,
        providerData: updatedUser.providerData,
        providerId: updatedUser.providerId,
        refreshToken: updatedUser.refreshToken,
        tenantId: updatedUser.tenantId,
        delete: updatedUser.delete,
        getIdToken: updatedUser.getIdToken,
        getIdTokenResult: updatedUser.getIdTokenResult,
        reload: updatedUser.reload,
        toJSON: updatedUser.toJSON,
        phoneNumber: updatedUser.phoneNumber,
        isAnonymous: updatedUser.isAnonymous,
      } as User);

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Update user error:', error);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    resetPassword,
    updateUser,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}