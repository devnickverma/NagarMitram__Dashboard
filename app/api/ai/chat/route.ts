import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { supabase } from '@/lib/supabase';

// Initialize Groq (FREE & FAST)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { message, context, executeAction } = await request.json();

    // If executing an action, do it directly
    if (executeAction) {
      return await executeActionFromChat(executeAction);
    }

    // Get real-time data from Supabase
    const realTimeData = await getRealTimeData();

    let aiResponse: string;
    let suggestedActions: any[] = [];
    let actionRequired: any = null;

    // Try Groq API (FREE)
    if (process.env.GROQ_API_KEY) {
      try {
        // Build messages array with conversation history
        const conversationHistory = context?.conversationHistory || [];
        const messagesArray: any[] = [
          {
            role: 'system',
            content: `You are a friendly AI assistant for CivicIssue admin panel with full database access. Be conversational and natural.

Rules:
- For greetings: Greet back warmly and ask how you can help
- For casual chat: Respond naturally, then offer to help
- For data questions: Answer directly with real data, keep it brief (2-4 sentences)
- You have full access to issues, comments, activities, and votes
- Always respond appropriately to what the user said
- Use markdown for emphasis but keep it minimal
- Maintain conversation context - remember what was just discussed

IMPORTANT: When the user asks to update, change, delete, or modify anything, DO NOT say you've done it. The system will detect the intent and show a confirmation prompt automatically. Just acknowledge their request briefly like "I can help you with that" or provide context about what will happen.`
          }
        ];

        // Add conversation history (last 10 messages for context)
        if (conversationHistory.length > 0) {
          const recentHistory = conversationHistory.slice(-10);
          messagesArray.push(...recentHistory);
        }

        // Add current database state
        messagesArray.push({
          role: 'user',
          content: `Database State:

ISSUES: ${realTimeData.totalIssues} total (${realTimeData.pendingIssues} pending, ${realTimeData.inProgressIssues} in progress, ${realTimeData.resolvedIssues} resolved)
- Critical/High: ${realTimeData.criticalCount}
- Created Today: ${realTimeData.todayCount}
- Categories: ${Object.entries(realTimeData.categories).map(([k, v]) => `${k}(${v})`).join(', ')}

Recent Issues:
${realTimeData.recentIssues.map((i: any) => `- "${i.title}" [${i.status}, ${i.priority}]`).join('\n')}

COMMENTS: ${realTimeData.totalComments} total
Most commented: ${realTimeData.issuesWithComments.map((i: any) => `"${i.title}"(${i.comments})`).join(', ')}

ACTIVITIES: Recent actions
${realTimeData.recentActivities.map((a: any) => `- ${a.type}: ${a.title}`).join('\n')}

VOTES: ${realTimeData.totalVotes} total
Most voted: ${realTimeData.mostVotedIssues.map((i: any) => `"${i.title}"(${i.votes})`).join(', ')}

User's latest message: "${message}"`
        })

        // Add the actual user message if not already in history
        if (!conversationHistory.some((m: any) => m.content === message && m.role === 'user')) {
          messagesArray.push({
            role: 'user',
            content: message
          });
        }

        const completion = await groq.chat.completions.create({
          messages: messagesArray,
          model: 'llama-3.1-8b-instant',
          temperature: 0.8,
          max_tokens: 250,
        });

        aiResponse = completion.choices[0]?.message?.content || '';

        // Check if AI wants to perform an action
        actionRequired = detectActionIntent(message, realTimeData);

        if (actionRequired) {
          aiResponse += `\n\n**Action Required:** ${actionRequired.description}\nReply 'yes' to confirm or 'no' to cancel.`;
        }

        suggestedActions = extractSmartActions(aiResponse, realTimeData);
      } catch (error) {
        console.error('Groq API error:', error);
        aiResponse = generateIntelligentResponse(message, realTimeData);
        suggestedActions = generateDataDrivenActions(message, realTimeData);
      }
    } else {
      // Use intelligent mock with real data (NO API KEY NEEDED)
      aiResponse = generateIntelligentResponse(message, realTimeData);
      suggestedActions = generateDataDrivenActions(message, realTimeData);
    }

    return NextResponse.json({
      response: aiResponse,
      suggested_actions: suggestedActions,
      action_required: actionRequired,
      context_updates: {},
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    
    return NextResponse.json({
      response: "I'm analyzing the current situation. Let me fetch the latest data for you.",
      suggested_actions: [
        { type: 'view', label: 'View Dashboard', target: '/dashboard' },
      ],
      context_updates: {},
    });
  }
}

async function getRealTimeData() {
  try {
    // Fetch all data in parallel
    const [
      { data: issues },
      { data: comments },
      { data: activities },
      { data: votes }
    ] = await Promise.all([
      supabase.from('issues').select('*').order('created_at', { ascending: false }),
      supabase.from('comments').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('votes').select('*')
    ]);

    const totalIssues = issues?.length || 0;
    const pendingIssues = issues?.filter(i => i.status === 'pending').length || 0;
    const inProgressIssues = issues?.filter(i => i.status === 'in_progress').length || 0;
    const resolvedIssues = issues?.filter(i => i.status === 'resolved').length || 0;
    const criticalCount = issues?.filter(i => i.priority === 'critical' || i.priority === 'high').length || 0;

    // Get issues created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIssues = issues?.filter(i => {
      const issueDate = new Date(i.created_at);
      issueDate.setHours(0, 0, 0, 0);
      return issueDate.getTime() === today.getTime();
    }) || [];

    // Get recent issues with details
    const recentIssues = issues?.slice(0, 5).map(i => ({
      title: i.title,
      category: i.category,
      status: i.status,
      priority: i.priority,
      created: new Date(i.created_at).toLocaleDateString(),
      description: i.description?.substring(0, 100) || ''
    })) || [];

    // Category breakdown
    const categories = issues?.reduce((acc: any, issue: any) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {}) || {};

    // Comment count per issue
    const commentCounts = comments?.reduce((acc: any, comment: any) => {
      acc[comment.issue_id] = (acc[comment.issue_id] || 0) + 1;
      return acc;
    }, {}) || {};

    // Most commented issues
    const issuesWithComments = issues?.map(i => ({
      title: i.title,
      comments: commentCounts[i.id] || 0
    })).sort((a, b) => b.comments - a.comments).slice(0, 3) || [];

    // Recent comments
    const recentComments = comments?.slice(0, 5).map(c => ({
      user: c.user_name,
      content: c.content?.substring(0, 100) || '',
      created: new Date(c.created_at).toLocaleDateString()
    })) || [];

    // Recent activities
    const recentActivities = activities?.slice(0, 5).map(a => ({
      type: a.type,
      title: a.title,
      user: a.user_name,
      created: new Date(a.created_at).toLocaleDateString()
    })) || [];

    // Vote counts per issue
    const voteCounts = votes?.reduce((acc: any, vote: any) => {
      acc[vote.issue_id] = (acc[vote.issue_id] || 0) + 1;
      return acc;
    }, {}) || {};

    // Most voted issues
    const mostVotedIssues = issues?.map(i => ({
      title: i.title,
      votes: voteCounts[i.id] || 0
    })).sort((a, b) => b.votes - a.votes).slice(0, 3) || [];

    return {
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      criticalCount,
      todayCount: todayIssues.length,
      recentIssues,
      categories,
      totalComments: comments?.length || 0,
      issuesWithComments,
      recentComments,
      recentActivities,
      totalVotes: votes?.length || 0,
      mostVotedIssues,
      issues: issues || []
    };
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    return {
      totalIssues: 0,
      pendingIssues: 0,
      inProgressIssues: 0,
      resolvedIssues: 0,
      criticalCount: 0,
      todayCount: 0,
      recentIssues: [],
      categories: {},
      totalComments: 0,
      issuesWithComments: [],
      recentComments: [],
      recentActivities: [],
      totalVotes: 0,
      mostVotedIssues: [],
      issues: []
    };
  }
}

function generateIntelligentResponse(message: string, data: any): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('critical') || lowerMessage.includes('urgent')) {
    if (data.criticalCount === 0) {
      return "Good news! There are currently no critical issues requiring immediate attention.";
    }
    return `I've identified ${data.criticalCount} critical issues requiring immediate attention. These should be prioritized for fastest resolution.`;
  }
  
  if (lowerMessage.includes('status') || lowerMessage.includes('overview')) {
    return `Current system status: ${data.totalIssues} total issues with ${data.pendingIssues} pending, ${data.inProgressIssues} in progress, and ${data.resolvedIssues} resolved. ${data.criticalCount > 0 ? `Alert: ${data.criticalCount} critical issues need attention!` : 'No critical issues at this time.'}`;
  }
  
  if (lowerMessage.includes('performance')) {
    const resolutionRate = data.totalIssues > 0 ? ((data.resolvedIssues / data.totalIssues) * 100).toFixed(1) : 0;
    return `System performance: ${resolutionRate}% resolution rate. ${data.inProgressIssues} issues are being actively worked on. ${data.pendingIssues > 10 ? 'High backlog detected - consider allocating more resources.' : 'Workload is manageable.'}`;
  }
  
  // Default response
  return `Based on current data: ${data.totalIssues} active issues in the system. ${data.criticalCount > 0 ? `Priority: ${data.criticalCount} critical issues need immediate attention.` : 'All systems operating normally.'} How can I help you manage these issues?`;
}

function generateDataDrivenActions(message: string, data: any): any[] {
  const actions = [];
  const lowerMessage = message.toLowerCase();
  
  if ((lowerMessage.includes('critical') || lowerMessage.includes('urgent')) && data.criticalCount > 0) {
    actions.push(
      { 
        type: 'filter', 
        label: `View ${data.criticalCount} Critical Issues`, 
        filter: { priority: 'critical', status: 'pending' } 
      }
    );
  }
  
  if (data.pendingIssues > 20) {
    actions.push(
      { 
        type: 'alert', 
        label: `Review ${data.pendingIssues} Pending Issues`, 
        filter: { status: 'pending' } 
      }
    );
  }
  
  // Always include a dashboard action
  if (actions.length === 0) {
    actions.push(
      { 
        type: 'view', 
        label: 'View Dashboard', 
        target: '/dashboard' 
      }
    );
  }
  
  return actions;
}

function extractSmartActions(response: string, data: any): any[] {
  const actions = [];
  
  if (response.includes('critical') && data.criticalCount > 0) {
    actions.push({ 
      type: 'filter', 
      label: 'Show Critical Issues', 
      filter: { priority: 'critical' } 
    });
  }
  
  if (response.includes('assign') || response.includes('team')) {
    actions.push({ 
      type: 'assign', 
      label: 'Manage Assignments', 
      action: 'show_assignment_modal' 
    });
  }
  
  return actions.length > 0 ? actions : generateDataDrivenActions('', data);
}

function detectActionIntent(message: string, data: any): any | null {
  const lowerMessage = message.toLowerCase();

  // Detect "update/change/set status" patterns - more flexible
  const updateStatusMatch = lowerMessage.match(/(?:update|change|set|make)\s+(?:the\s+)?(?:status\s+(?:of\s+)?)?(?:issue\s+)?[""']?(.+?)[""']?\s+(?:to|as)\s+(resolved|pending|in progress|in_progress)/i);
  if (updateStatusMatch) {
    const issueTitle = updateStatusMatch[1];
    const newStatus = updateStatusMatch[2].replace(' ', '_');

    // Find matching issue
    const matchingIssue = data.issues.find((i: any) =>
      i.title.toLowerCase().includes(issueTitle.toLowerCase())
    );

    if (matchingIssue) {
      return {
        type: 'update_status',
        description: `Update issue "${matchingIssue.title}" to ${newStatus}`,
        params: {
          issueId: matchingIssue.id,
          status: newStatus,
          title: matchingIssue.title
        }
      };
    }
  }

  // Detect "mark as resolved/pending/in progress" patterns
  const statusMatch = lowerMessage.match(/mark\s+(?:the\s+)?(?:issue\s+)?[""']?(.+?)[""']?\s+as\s+(resolved|pending|in progress|in_progress)/i);
  if (statusMatch) {
    const issueTitle = statusMatch[1];
    const newStatus = statusMatch[2].replace(' ', '_');

    // Find matching issue
    const matchingIssue = data.issues.find((i: any) =>
      i.title.toLowerCase().includes(issueTitle.toLowerCase())
    );

    if (matchingIssue) {
      return {
        type: 'update_status',
        description: `Mark issue "${matchingIssue.title}" as ${newStatus}`,
        params: {
          issueId: matchingIssue.id,
          status: newStatus,
          title: matchingIssue.title
        }
      };
    }
  }

  // Detect simple "resolve X" or "make X resolved"
  const simpleResolveMatch = lowerMessage.match(/(?:resolve|make\s+resolved)\s+(?:issue\s+)?[""']?(.+?)[""']?$/i);
  if (simpleResolveMatch) {
    const issueTitle = simpleResolveMatch[1];

    const matchingIssue = data.issues.find((i: any) =>
      i.title.toLowerCase().includes(issueTitle.toLowerCase())
    );

    if (matchingIssue) {
      return {
        type: 'update_status',
        description: `Mark issue "${matchingIssue.title}" as resolved`,
        params: {
          issueId: matchingIssue.id,
          status: 'resolved',
          title: matchingIssue.title
        }
      };
    }
  }

  // Detect "assign to" patterns
  const assignMatch = lowerMessage.match(/assign\s+(?:issue\s+)?[""']?(.+?)[""']?\s+to\s+(.+)/i);
  if (assignMatch) {
    const issueTitle = assignMatch[1];
    const assignee = assignMatch[2];

    const matchingIssue = data.issues.find((i: any) =>
      i.title.toLowerCase().includes(issueTitle.toLowerCase())
    );

    if (matchingIssue) {
      return {
        type: 'assign_issue',
        description: `Assign issue "${matchingIssue.title}" to ${assignee}`,
        params: {
          issueId: matchingIssue.id,
          assignedTo: assignee,
          title: matchingIssue.title
        }
      };
    }
  }

  // Detect "delete" patterns
  const deleteMatch = lowerMessage.match(/delete\s+(?:the\s+)?(?:issue\s+)?[""']?(.+?)[""']?/i);
  if (deleteMatch) {
    const issueTitle = deleteMatch[1];

    const matchingIssue = data.issues.find((i: any) =>
      i.title.toLowerCase().includes(issueTitle.toLowerCase())
    );

    if (matchingIssue) {
      return {
        type: 'delete_issue',
        description: `Delete issue "${matchingIssue.title}"`,
        params: {
          issueId: matchingIssue.id,
          title: matchingIssue.title
        }
      };
    }
  }

  return null;
}

async function executeActionFromChat(action: any) {
  try {
    // Call the action based on type directly
    switch (action.type) {
      case 'update_status':
        const { issueId: updateId, status, title: updateTitle } = action.params;
        const { data: updateData, error: updateError } = await supabase
          .from('issues')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', updateId)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json({
            response: `❌ Failed to update issue: ${updateError.message}`,
            success: false
          });
        }

        return NextResponse.json({
          response: `✅ Successfully updated issue "${updateTitle}" to ${status}`,
          success: true
        });

      case 'assign_issue':
        const { issueId: assignId, assignedTo, title: assignTitle } = action.params;
        const { data: assignData, error: assignError } = await supabase
          .from('issues')
          .update({ assigned_to: assignedTo, updated_at: new Date().toISOString() })
          .eq('id', assignId)
          .select()
          .single();

        if (assignError) {
          return NextResponse.json({
            response: `❌ Failed to assign issue: ${assignError.message}`,
            success: false
          });
        }

        return NextResponse.json({
          response: `✅ Successfully assigned issue "${assignTitle}" to ${assignedTo}`,
          success: true
        });

      case 'delete_issue':
        const { issueId: deleteId, title: deleteTitle } = action.params;
        const { error: deleteError } = await supabase
          .from('issues')
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          return NextResponse.json({
            response: `❌ Failed to delete issue: ${deleteError.message}`,
            success: false
          });
        }

        return NextResponse.json({
          response: `✅ Successfully deleted issue "${deleteTitle}"`,
          success: true
        });

      default:
        return NextResponse.json({
          response: '❌ Unknown action type',
          success: false
        });
    }
  } catch (error) {
    console.error('Action execution error:', error);
    return NextResponse.json({
      response: '❌ Failed to execute action',
      success: false
    });
  }
}