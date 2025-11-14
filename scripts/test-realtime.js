// Test script to add issues to Supabase and verify real-time updates
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwflrcmaxivxphsdkyyy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmxyY21heGl2eHBoc2RreXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NjcyMzUsImV4cCI6MjA3NDQ0MzIzNX0.okMH_oGgYrCTiFGA5v17VjQOKe6KdfyZUDl3y3bfPN0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Jharkhand locations
const locations = [
  { lat: 23.3441, lng: 85.3096, address: 'Main Road, Ranchi' },
  { lat: 22.8046, lng: 86.2029, address: 'Bistupur, Jamshedpur' },
  { lat: 23.6693, lng: 86.1511, address: 'Bank More, Dhanbad' },
  { lat: 23.7957, lng: 86.4304, address: 'Sector 4, Bokaro' },
  { lat: 24.4798, lng: 85.5556, address: 'Canary Hill, Hazaribagh' },
];

const categories = ['Road', 'Water', 'Electricity', 'Sanitation', 'Traffic', 'Other'];
const priorities = ['low', 'medium', 'high', 'critical'];
const statuses = ['pending', 'in_progress'];

async function createTestIssue() {
  const location = locations[Math.floor(Math.random() * locations.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const priority = priorities[Math.floor(Math.random() * priorities.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  const issue = {
    title: `${category} issue at ${location.address}`,
    description: `This is a test ${priority} priority ${category.toLowerCase()} issue that needs attention.`,
    category: category,
    status: status,
    priority: priority,
    location: {
      lat: location.lat,
      lng: location.lng,
      address: location.address
    },
    user_id: 'test-user-' + Math.random().toString(36).substr(2, 9),
    user_name: 'Test User',
    user_email: 'test@example.com',
    votes: Math.floor(Math.random() * 50),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('Creating issue:', issue.title);
  
  const { data, error } = await supabase
    .from('issues')
    .insert([issue])
    .select();

  if (error) {
    console.error('Error creating issue:', error);
  } else {
    console.log('✅ Issue created successfully:', data[0].id);
  }
}

// Create a test issue
console.log('🚀 Testing real-time sync...');
console.log('📍 Creating a new issue in Jharkhand...');
createTestIssue().then(() => {
  console.log('✨ Check your admin dashboard - the issue should appear in real-time!');
  console.log('📱 The map should update with the new location marker');
  console.log('📊 Stats should update automatically');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});