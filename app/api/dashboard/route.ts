import { NextResponse } from 'next/server';

export async function GET() {
  // Mock dashboard data
  const dashboardData = {
    stats: {
      totalIssues: 1284,
      resolvedToday: 47,
      inProgress: 126,
      criticalIssues: 23,
    },
    issues: [
      {
        id: '#1284',
        title: 'Pothole on Main Street',
        category: 'Road',
        location: { lat: 40.7128, lng: -74.0060 },
        address: 'Main St & 5th Ave',
        priority: 'high',
        status: 'new',
        reportedAt: new Date().toISOString(),
        severity: 9.2,
      },
      {
        id: '#1283',
        title: 'Broken Streetlight',
        category: 'Lighting',
        location: { lat: 40.7260, lng: -73.9960 },
        address: 'Park Avenue',
        priority: 'medium',
        status: 'in-progress',
        assignedTo: 'Team A',
        reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        severity: 6.5,
      },
      {
        id: '#1282',
        title: 'Overflowing Trash Bin',
        category: 'Sanitation',
        location: { lat: 40.7080, lng: -74.0180 },
        address: 'City Center',
        priority: 'low',
        status: 'resolved',
        assignedTo: 'Team C',
        reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        severity: 4.2,
      },
      {
        id: '#1281',
        title: 'Graffiti on Bridge',
        category: 'Vandalism',
        location: { lat: 40.7580, lng: -73.9855 },
        address: 'Bridge Underpass',
        priority: 'low',
        status: 'in-progress',
        assignedTo: 'Team D',
        reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        severity: 3.8,
      },
      {
        id: '#1280',
        title: 'Water Leak',
        category: 'Water',
        location: { lat: 40.7489, lng: -73.9680 },
        address: 'Oak Street',
        priority: 'high',
        status: 'new',
        reportedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        severity: 8.8,
      },
    ],
    activities: [
      {
        id: '1',
        type: 'issue_resolved',
        title: 'Issue Resolved',
        description: 'Pothole on Elm Street has been fixed by Team A',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'team_dispatched',
        title: 'Team Dispatched',
        description: 'Team B dispatched to water leak on Oak Street',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'issue_created',
        title: 'New Critical Issue',
        description: 'Traffic light malfunction reported at Downtown Junction',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
    ],
  };

  return NextResponse.json(dashboardData);
}