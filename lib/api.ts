import { supabase } from './supabase';

interface ApiResponse<T> {
  data?: T;
  issues?: T;
  users?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class AdminApiService {
  // Issues
  async getIssues(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
  }) {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('issues')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply pagination and sorting
      query = query
        .range(from, to)
        .order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        issues: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      console.error('Get issues error:', error);
      throw error;
    }
  }

  async getIssueById(id: string) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Get issue error:', error);
      throw error;
    }
  }

  async updateIssue(id: string, updates: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assigned_to?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Update issue error:', error);
      throw error;
    }
  }

  async deleteIssue(id: string) {
    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete issue error:', error);
      throw error;
    }
  }

  // Users
  async getUsers(filters?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }) {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('users')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters?.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`display_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Apply pagination and sorting
      query = query
        .range(from, to)
        .order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        // If users table doesn't exist or is empty, return mock data
        console.log('Users table error (non-critical):', error);
        return {
          users: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        };
      }

      return {
        users: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      console.error('Get users error:', error);
      // Return empty data instead of throwing
      return {
        users: [],
        pagination: {
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          total: 0,
          pages: 0,
        },
      };
    }
  }

  async updateUser(id: string, updates: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          display_name: updates.name,
          email: updates.email,
          phone: updates.phone,
          role: updates.role,
          status: updates.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  // Statistics
  async getStats() {
    try {
      const { data: issues, error } = await supabase
        .from('issues')
        .select('*');

      if (error) throw error;

      const totalIssues = issues?.length || 0;
      const pendingIssues = issues?.filter(i => i.status === 'pending').length || 0;
      const inProgressIssues = issues?.filter(i => i.status === 'in_progress').length || 0;
      const resolvedIssues = issues?.filter(i => i.status === 'resolved').length || 0;
      const criticalIssues = issues?.filter(i => i.priority === 'critical').length || 0;

      // Calculate category breakdown
      const categoryBreakdown = issues?.reduce((acc: any, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        total: totalIssues,
        pending: pendingIssues,
        in_progress: inProgressIssues,
        resolved: resolvedIssues,
        critical: criticalIssues,
        resolution_rate: totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0,
        categories: categoryBreakdown,
      };
    } catch (error) {
      console.error('Get stats error:', error);
      // Return default stats if error
      return {
        total: 0,
        pending: 0,
        in_progress: 0,
        resolved: 0,
        critical: 0,
        resolution_rate: 0,
        categories: {},
      };
    }
  }

  // Comments
  async getComments(issueId: string) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('issue_id', issueId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      console.error('Get comments error:', error);
      return { data: [] };
    }
  }

  async addComment(issueId: string, content: string, userId: string, userName: string) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          issue_id: issueId,
          user_id: userId,
          user_name: userName,
          content,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToIssues(callback: (payload: any) => void) {
    return supabase
      .channel('issues-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, callback)
      .subscribe();
  }

  unsubscribeFromIssues(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
}

export default new AdminApiService();