import { PrismaClient, Role, IssueCategory, IssuePriority, IssueStatus, AnnouncementCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Clean existing data
    await prisma.notification.deleteMany();
    await prisma.lostFoundClaim.deleteMany();
    await prisma.lostFound.deleteMany();
    await prisma.reaction.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.announcementRead.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.issueStatusHistory.deleteMany();
    await prisma.issue.deleteMany();
    await prisma.user.deleteMany();
    await prisma.block.deleteMany();
    await prisma.hostel.deleteMany();

    console.log('Cleaned existing data');

    // Create Hostels
    const hostels = await Promise.all([
      prisma.hostel.create({
        data: {
          name: 'Boys Hostel A',
          address: 'Main Campus, Building A',
          capacity: 200,
        },
      }),
      prisma.hostel.create({
        data: {
          name: 'Girls Hostel B',
          address: 'Main Campus, Building B',
          capacity: 150,
        },
      }),
      prisma.hostel.create({
        data: {
          name: 'International Hostel C',
          address: 'North Campus, Building C',
          capacity: 100,
        },
      }),
    ]);

    console.log(`Created ${hostels.length} hostels`);

    // Create Blocks
    const blocks = await Promise.all([
      // Boys Hostel A blocks
      prisma.block.create({
        data: {
          name: 'A-Wing',
          hostelId: hostels[0].id,
        },
      }),
      prisma.block.create({
        data: {
          name: 'B-Wing',
          hostelId: hostels[0].id,
        },
      }),
      prisma.block.create({
        data: {
          name: 'C-Wing',
          hostelId: hostels[0].id,
        },
      }),
      // Girls Hostel B blocks
      prisma.block.create({
        data: {
          name: 'Ground Floor',
          hostelId: hostels[1].id,
        },
      }),
      prisma.block.create({
        data: {
          name: 'First Floor',
          hostelId: hostels[1].id,
        },
      }),
      // International Hostel C blocks
      prisma.block.create({
        data: {
          name: 'East Wing',
          hostelId: hostels[2].id,
        },
      }),
      prisma.block.create({
        data: {
          name: 'West Wing',
          hostelId: hostels[2].id,
        },
      }),
    ]);

    console.log(`Created ${blocks.length} blocks`);

    // Create Users
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const users = await Promise.all([
      // Management user
      prisma.user.create({
        data: {
          email: 'admin@hostel.com',
          password: hashedPassword,
          name: 'John Administrator',
          rollNumber: 'ADMIN001',
          phone: '+1234567890',
          emergencyContact: '+1234567891',
          role: Role.MANAGEMENT,
          isVerified: true,
          hostelId: hostels[0].id,
          blockId: blocks[0].id,
          roomNumber: 'OFFICE-001',
        },
      }),
      // Staff users
      prisma.user.create({
        data: {
          email: 'maintenance@hostel.com',
          password: hashedPassword,
          name: 'Mike Technician',
          rollNumber: 'STAFF001',
          phone: '+1234567892',
          emergencyContact: '+1234567893',
          role: Role.STAFF,
          isVerified: true,
          hostelId: hostels[0].id,
          blockId: blocks[0].id,
          roomNumber: 'MAINT-001',
        },
      }),
      prisma.user.create({
        data: {
          email: 'electrician@hostel.com',
          password: hashedPassword,
          name: 'Sarah Electrician',
          rollNumber: 'STAFF002',
          phone: '+1234567894',
          emergencyContact: '+1234567895',
          role: Role.STAFF,
          isVerified: true,
          hostelId: hostels[1].id,
          blockId: blocks[3].id,
          roomNumber: 'ELEC-001',
        },
      }),
      // Student users
      prisma.user.create({
        data: {
          email: 'student1@college.edu',
          password: hashedPassword,
          name: 'Alice Student',
          rollNumber: 'CS2024001',
          phone: '+1234567896',
          emergencyContact: '+1234567897',
          role: Role.STUDENT,
          isVerified: true,
          hostelId: hostels[0].id,
          blockId: blocks[0].id,
          roomNumber: 'A-101',
        },
      }),
      prisma.user.create({
        data: {
          email: 'student2@college.edu',
          password: hashedPassword,
          name: 'Bob Student',
          rollNumber: 'CS2024002',
          phone: '+1234567898',
          emergencyContact: '+1234567899',
          role: Role.STUDENT,
          isVerified: true,
          hostelId: hostels[1].id,
          blockId: blocks[3].id,
          roomNumber: 'G-201',
        },
      }),
      prisma.user.create({
        data: {
          email: 'student3@college.edu',
          password: hashedPassword,
          name: 'Charlie Student',
          rollNumber: 'EC2024001',
          phone: '+1234567800',
          emergencyContact: '+1234567801',
          role: Role.STUDENT,
          isVerified: true,
          hostelId: hostels[2].id,
          blockId: blocks[5].id,
          roomNumber: 'W-305',
        },
      }),
    ]);

    console.log(`Created ${users.length} users`);

    // Create Sample Issues
    const issues = await Promise.all([
      prisma.issue.create({
        data: {
          title: 'Water leakage in bathroom',
          description: 'There is a significant water leakage from the bathroom pipe that needs immediate attention.',
          category: IssueCategory.PLUMBING,
          priority: IssuePriority.HIGH,
          visibility: 'PUBLIC',
          status: IssueStatus.REPORTED,
          images: ['https://res.cloudinary.com/demo/image/upload/water_leak.jpg'],
          videos: [],
          reportedById: users[3].id,
          assignedToId: users[1].id,
          hostelId: hostels[0].id,
          blockId: blocks[0].id,
          roomNumber: 'A-101',
          reportedAt: new Date(),
        },
      }),
      prisma.issue.create({
        data: {
          title: 'Power outage in wing',
          description: 'The entire A-Wing has been without power for the last 2 hours.',
          category: IssueCategory.ELECTRICAL,
          priority: IssuePriority.EMERGENCY,
          visibility: 'PUBLIC',
          status: IssueStatus.ASSIGNED,
          images: [],
          videos: [],
          reportedById: users[4].id,
          assignedToId: users[2].id,
          hostelId: hostels[1].id,
          blockId: blocks[3].id,
          roomNumber: 'G-201',
          reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          assignedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      }),
      prisma.issue.create({
        data: {
          title: 'Wi-Fi not working',
          description: 'Internet connection is very slow or completely disconnected in room W-305.',
          category: IssueCategory.INTERNET,
          priority: IssuePriority.MEDIUM,
          visibility: 'PRIVATE',
          status: IssueStatus.IN_PROGRESS,
          images: [],
          videos: [],
          reportedById: users[5].id,
          assignedToId: users[1].id,
          hostelId: hostels[2].id,
          blockId: blocks[5].id,
          roomNumber: 'W-305',
          reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          assignedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          inProgressAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      }),
    ]);

    console.log(`Created ${issues.length} issues`);

    // Create Status History for issues
    await Promise.all([
      prisma.issueStatusHistory.create({
        data: {
          issueId: issues[0].id,
          status: IssueStatus.REPORTED,
          remarks: 'Initial report submitted',
          changedById: users[3].id,
          changedAt: issues[0].reportedAt,
        },
      }),
      prisma.issueStatusHistory.create({
        data: {
          issueId: issues[1].id,
          status: IssueStatus.REPORTED,
          remarks: 'Power outage reported by student',
          changedById: users[4].id,
          changedAt: issues[1].reportedAt,
        },
      }),
      prisma.issueStatusHistory.create({
        data: {
          issueId: issues[1].id,
          status: IssueStatus.ASSIGNED,
          remarks: 'Assigned to electrician team',
          changedById: users[0].id,
          changedAt: issues[1].assignedAt!,
        },
      }),
    ]);

    // Create Sample Announcements
    const announcements = await Promise.all([
      prisma.announcement.create({
        data: {
          title: 'Water Supply Maintenance',
          content: 'Water supply will be interrupted tomorrow from 9 AM to 2 PM for maintenance work. Please store water accordingly.',
          category: AnnouncementCategory.WATER_ELECTRICITY,
          priority: true,
          images: [],
          attachments: [],
          hostelId: null, // All hostels
          blockIds: [],
          targetRoles: [Role.STUDENT, Role.STAFF],
          publishAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      }),
      prisma.announcement.create({
        data: {
          title: 'Cleaning Schedule Update',
          content: 'Regular cleaning schedule has been updated. Rooms will be cleaned every Monday and Thursday.',
          category: AnnouncementCategory.CLEANING_SCHEDULE,
          priority: false,
          images: [],
          attachments: [],
          hostelId: hostels[0].id, // Boys Hostel A only
          blockIds: [blocks[0].id, blocks[1].id], // A-Wing and B-Wing only
          targetRoles: [Role.STUDENT],
          publishAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      }),
    ]);

    console.log(`Created ${announcements.length} announcements`);

    // Create Lost & Found Items
    const lostFoundItems = await Promise.all([
      prisma.lostFound.create({
        data: {
          itemName: 'Blue Backpack',
          description: 'Blue Nike backpack with laptop compartment. Contains books and notebooks.',
          category: 'Clothing',
          location: 'A-Wing Common Room',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          status: 'LOST',
          images: [],
          reportedById: users[3].id,
        },
      }),
      prisma.lostFound.create({
        data: {
          itemName: 'Silver Watch',
          description: 'Silver analog watch with leather strap. Found near cafeteria.',
          category: 'Electronics',
          location: 'Main Cafeteria',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          status: 'FOUND',
          images: [],
          reportedById: users[4].id,
        },
      }),
    ]);

    console.log(`Created ${lostFoundItems.length} lost & found items`);

    console.log('Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- Hostels: ${hostels.length}`);
    console.log(`- Blocks: ${blocks.length}`);
    console.log(`- Users: ${users.length} (1 admin, 2 staff, 3 students)`);
    console.log(`- Issues: ${issues.length}`);
    console.log(`- Announcements: ${announcements.length}`);
    console.log(`- Lost & Found: ${lostFoundItems.length}`);

    console.log('\nLogin Credentials:');
    console.log('Admin: admin@hostel.com / admin123');
    console.log('Staff: maintenance@hostel.com / admin123');
    console.log('Staff: electrician@hostel.com / admin123');
    console.log('Student: student1@college.edu / admin123');
    console.log('Student: student2@college.edu / admin123');
    console.log('Student: student3@college.edu / admin123');

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
};

seedData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });