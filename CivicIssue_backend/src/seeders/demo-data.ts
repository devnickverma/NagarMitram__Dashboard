import { User, Issue } from '../models';
import bcrypt from 'bcryptjs';

export const seedDemoData = async () => {
  try {
    // Check if data already exists
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('Demo data already exists, skipping seed');
      return;
    }

    console.log('Seeding demo data...');

    // Create demo users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@city.gov',
      phone: '+1 555-0001',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    });

    const staffUser = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah.j@city.gov',
      phone: '+1 555-0002',
      password: hashedPassword,
      role: 'staff',
      status: 'active',
    });

    const citizenUser1 = await User.create({
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 555-0123',
      password: hashedPassword,
      role: 'citizen',
      status: 'active',
    });

    const citizenUser2 = await User.create({
      name: 'Mike Davis',
      email: 'mike.davis@email.com',
      phone: '+1 555-0456',
      password: hashedPassword,
      role: 'citizen',
      status: 'active',
    });

    // Create demo issues
    await Issue.create({
      title: 'Large pothole causing traffic delays',
      description: 'There is a significant pothole on Main Street near the intersection with 5th Avenue. It\'s causing vehicles to swerve and creating traffic congestion during rush hours.',
      category: 'road',
      priority: 'high',
      status: 'new',
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'Main St & 5th Ave, Downtown',
      reportedBy: citizenUser1.id,
    });

    await Issue.create({
      title: 'Broken street light in residential area',
      description: 'The street light on Park Avenue has been flickering for a week and is now completely out, creating safety concerns for pedestrians.',
      category: 'lighting',
      priority: 'medium',
      status: 'in-progress',
      latitude: 40.7260,
      longitude: -73.9960,
      address: 'Park Avenue, Residential District',
      reportedBy: citizenUser1.id,
      assignedTo: staffUser.id,
    });

    await Issue.create({
      title: 'Overflowing public trash bin',
      description: 'The trash bin in City Center Plaza has been overflowing for several days, attracting pests and creating unsanitary conditions.',
      category: 'sanitation',
      priority: 'low',
      status: 'resolved',
      latitude: 40.7080,
      longitude: -74.0180,
      address: 'City Center Plaza',
      reportedBy: citizenUser2.id,
      assignedTo: staffUser.id,
    });

    await Issue.create({
      title: 'Damaged park bench needs repair',
      description: 'The wooden bench near the playground has broken slats and splinters, making it unsafe for families with children.',
      category: 'parks',
      priority: 'medium',
      status: 'new',
      latitude: 40.7200,
      longitude: -74.0100,
      address: 'Central Park, Playground Area',
      reportedBy: citizenUser2.id,
    });

    await Issue.create({
      title: 'Water main leak on Oak Street',
      description: 'There appears to be a small water leak near the curb on Oak Street. Water has been pooling for the past two days.',
      category: 'water',
      priority: 'high',
      status: 'in-progress',
      latitude: 40.7300,
      longitude: -73.9900,
      address: 'Oak Street, Block 400',
      reportedBy: citizenUser1.id,
      assignedTo: staffUser.id,
    });

    console.log('✅ Demo data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
  }
};