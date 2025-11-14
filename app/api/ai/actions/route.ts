import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { action, params } = await request.json();

    switch (action) {
      case 'update_issue_status':
        return await updateIssueStatus(params);

      case 'assign_issue':
        return await assignIssue(params);

      case 'update_priority':
        return await updatePriority(params);

      case 'delete_issue':
        return await deleteIssue(params);

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Action error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to execute action'
    }, { status: 500 });
  }
}

async function updateIssueStatus(params: any) {
  const { issueId, status } = params;

  if (!issueId || !status) {
    return NextResponse.json({
      success: false,
      error: 'Missing issueId or status'
    }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('issues')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', issueId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data,
    message: `Issue status updated to ${status}`
  });
}

async function assignIssue(params: any) {
  const { issueId, assignedTo } = params;

  if (!issueId || !assignedTo) {
    return NextResponse.json({
      success: false,
      error: 'Missing issueId or assignedTo'
    }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('issues')
    .update({
      assigned_to: assignedTo,
      updated_at: new Date().toISOString()
    })
    .eq('id', issueId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data,
    message: `Issue assigned to ${assignedTo}`
  });
}

async function updatePriority(params: any) {
  const { issueId, priority } = params;

  if (!issueId || !priority) {
    return NextResponse.json({
      success: false,
      error: 'Missing issueId or priority'
    }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('issues')
    .update({
      priority,
      updated_at: new Date().toISOString()
    })
    .eq('id', issueId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data,
    message: `Issue priority updated to ${priority}`
  });
}

async function deleteIssue(params: any) {
  const { issueId } = params;

  if (!issueId) {
    return NextResponse.json({
      success: false,
      error: 'Missing issueId'
    }, { status: 400 });
  }

  const { error } = await supabase
    .from('issues')
    .delete()
    .eq('id', issueId);

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Issue deleted successfully'
  });
}
