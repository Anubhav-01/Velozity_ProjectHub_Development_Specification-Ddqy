import { PrismaClient, Role, TaskStatus, TaskPriority, ProjectStatus, ActivityType, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Velozity ProjectHub database...');

  // ============================================================
  // CLEAN EXISTING DATA (order matters for FK constraints)
  // ============================================================
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================
  // USERS
  // ============================================================
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const pmPassword = await bcrypt.hash('Manager123!', 12);
  const devPassword = await bcrypt.hash('Dev123!', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Alex Chen',
      email: 'admin@velozity.dev',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      name: 'Sarah Mitchell',
      email: 'pm1@velozity.dev',
      passwordHash: pmPassword,
      role: Role.PROJECT_MANAGER,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: 'James Rivera',
      email: 'pm2@velozity.dev',
      passwordHash: pmPassword,
      role: Role.PROJECT_MANAGER,
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      name: 'Ravi Patel',
      email: 'dev1@velozity.dev',
      passwordHash: devPassword,
      role: Role.DEVELOPER,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: 'Emma Watson',
      email: 'dev2@velozity.dev',
      passwordHash: devPassword,
      role: Role.DEVELOPER,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: 'Carlos Mendez',
      email: 'dev3@velozity.dev',
      passwordHash: devPassword,
      role: Role.DEVELOPER,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      name: 'Aisha Johnson',
      email: 'dev4@velozity.dev',
      passwordHash: devPassword,
      role: Role.DEVELOPER,
    },
  });

  console.log('✅ Created 7 users (1 admin, 2 PMs, 4 developers)');

  // ============================================================
  // CLIENTS
  // ============================================================
  const client1 = await prisma.client.create({
    data: {
      name: 'Marcus Thompson',
      email: 'marcus@technovate.io',
      companyName: 'TechnoVate Solutions',
      phone: '+1-555-0101',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Diana Voss',
      email: 'diana@brandcraft.co',
      companyName: 'BrandCraft Agency',
      phone: '+1-555-0202',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Robert Kim',
      email: 'robert@nexahealth.com',
      companyName: 'NexaHealth Systems',
      phone: '+1-555-0303',
    },
  });

  console.log('✅ Created 3 clients');

  // ============================================================
  // PROJECTS
  // ============================================================
  const now = new Date();

  const project1 = await prisma.project.create({
    data: {
      name: 'TechnoVate E-Commerce Platform',
      description: 'Building a full-stack e-commerce platform with real-time inventory management, payment processing, and analytics dashboard for TechnoVate Solutions.',
      status: ProjectStatus.ACTIVE,
      clientId: client1.id,
      createdById: pm1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'BrandCraft Marketing Suite',
      description: 'Developing a comprehensive digital marketing suite with campaign management, A/B testing, social media integration, and detailed performance analytics.',
      status: ProjectStatus.ACTIVE,
      clientId: client2.id,
      createdById: pm1.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'NexaHealth Patient Portal',
      description: 'Creating a HIPAA-compliant patient portal for NexaHealth with appointment booking, medical records access, telemedicine support, and prescription tracking.',
      status: ProjectStatus.ACTIVE,
      clientId: client3.id,
      createdById: pm2.id,
    },
  });

  const project4 = await prisma.project.create({
    data: {
      name: 'TechnoVate Mobile App',
      description: 'Cross-platform React Native mobile application for TechnoVate\'s customer-facing product, integrating with existing backend APIs.',
      status: ProjectStatus.ON_HOLD,
      clientId: client1.id,
      createdById: pm2.id,
    },
  });

  console.log('✅ Created 4 projects');

  // ============================================================
  // TASKS — Project 1: TechnoVate E-Commerce Platform
  // ============================================================
  const pastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const futureDate = (daysFromNow: number) => new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);

  const task1_1 = await prisma.task.create({
    data: {
      title: 'Design database schema for product catalog',
      description: 'Create comprehensive PostgreSQL schema with proper indexes for products, categories, variants, and inventory tables. Include migration scripts.',
      projectId: project1.id,
      assignedDeveloperId: dev1.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: pastDate(10),
      isOverdue: false,
    },
  });

  const task1_2 = await prisma.task.create({
    data: {
      title: 'Implement user authentication and authorization',
      description: 'Build JWT-based auth system with role-based access control for customers, store managers, and admins. Include OAuth2 social login.',
      projectId: project1.id,
      assignedDeveloperId: dev2.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDate(7),
      isOverdue: false,
    },
  });

  const task1_3 = await prisma.task.create({
    data: {
      title: 'Build product listing and search API',
      description: 'RESTful API endpoints for product CRUD, full-text search with Elasticsearch integration, filtering by category/price/rating, and pagination.',
      projectId: project1.id,
      assignedDeveloperId: dev1.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: futureDate(3),
      isOverdue: false,
    },
  });

  const task1_4 = await prisma.task.create({
    data: {
      title: 'Integrate Stripe payment processing',
      description: 'Implement Stripe payment gateway for one-time purchases, subscriptions, and refunds. Handle webhooks for payment status updates.',
      projectId: project1.id,
      assignedDeveloperId: dev3.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: futureDate(7),
      isOverdue: false,
    },
  });

  const task1_5 = await prisma.task.create({
    data: {
      title: 'Create React storefront with cart functionality',
      description: 'Build responsive React frontend with product browsing, shopping cart, checkout flow, and order tracking. Use Tailwind CSS for styling.',
      projectId: project1.id,
      assignedDeveloperId: dev2.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: futureDate(14),
      isOverdue: false,
    },
  });

  // OVERDUE TASK 1
  const task1_6 = await prisma.task.create({
    data: {
      title: 'Implement real-time inventory tracking',
      description: 'Build WebSocket-based real-time inventory updates with low-stock alerts and automated reorder notifications. OVERDUE - needs immediate attention.',
      projectId: project1.id,
      assignedDeveloperId: dev4.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: pastDate(5),
      isOverdue: true,
    },
  });

  const task1_7 = await prisma.task.create({
    data: {
      title: 'Build analytics dashboard',
      description: 'Sales analytics dashboard with revenue charts, top products, customer insights, and exportable reports using Chart.js.',
      projectId: project1.id,
      assignedDeveloperId: dev3.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate(21),
      isOverdue: false,
    },
  });

  console.log('✅ Created 7 tasks for Project 1');

  // ============================================================
  // TASKS — Project 2: BrandCraft Marketing Suite
  // ============================================================
  const task2_1 = await prisma.task.create({
    data: {
      title: 'Campaign management module',
      description: 'Build the core campaign creation and management interface with support for multi-channel campaigns (email, social, display ads).',
      projectId: project2.id,
      assignedDeveloperId: dev1.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: futureDate(10),
      isOverdue: false,
    },
  });

  const task2_2 = await prisma.task.create({
    data: {
      title: 'A/B testing framework implementation',
      description: 'Develop statistical A/B testing engine with variant management, traffic splitting, significance calculations, and reporting.',
      projectId: project2.id,
      assignedDeveloperId: dev2.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate(20),
      isOverdue: false,
    },
  });

  // OVERDUE TASK 2
  const task2_3 = await prisma.task.create({
    data: {
      title: 'Social media API integrations',
      description: 'Connect Facebook, Instagram, Twitter, and LinkedIn APIs for post scheduling, engagement tracking, and analytics aggregation. OVERDUE.',
      projectId: project2.id,
      assignedDeveloperId: dev3.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDate(3),
      isOverdue: true,
    },
  });

  const task2_4 = await prisma.task.create({
    data: {
      title: 'Email template builder',
      description: 'Drag-and-drop email template builder with responsive preview, variable substitution, and integration with Mailchimp/SendGrid.',
      projectId: project2.id,
      assignedDeveloperId: dev4.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate(15),
      isOverdue: false,
    },
  });

  const task2_5 = await prisma.task.create({
    data: {
      title: 'Performance analytics and reporting',
      description: 'Comprehensive analytics with ROI tracking, conversion funnels, custom report generation, and PDF/CSV exports.',
      projectId: project2.id,
      assignedDeveloperId: dev1.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: futureDate(30),
      isOverdue: false,
    },
  });

  const task2_6 = await prisma.task.create({
    data: {
      title: 'Setup CI/CD pipeline and staging environment',
      description: 'Configure GitHub Actions CI/CD with automated testing, staging deployment, and production release workflow.',
      projectId: project2.id,
      assignedDeveloperId: dev2.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: pastDate(14),
      isOverdue: false,
    },
  });

  console.log('✅ Created 6 tasks for Project 2');

  // ============================================================
  // TASKS — Project 3: NexaHealth Patient Portal
  // ============================================================
  const task3_1 = await prisma.task.create({
    data: {
      title: 'HIPAA compliance architecture review',
      description: 'Security audit and architecture review to ensure HIPAA compliance. Document data flows, encryption standards, access controls, and audit logging.',
      projectId: project3.id,
      assignedDeveloperId: dev3.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDate(20),
      isOverdue: false,
    },
  });

  const task3_2 = await prisma.task.create({
    data: {
      title: 'Patient authentication and MFA',
      description: 'Implement secure patient login with multi-factor authentication (SMS/TOTP), session management, and HIPAA-compliant audit logging.',
      projectId: project3.id,
      assignedDeveloperId: dev4.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.CRITICAL,
      dueDate: futureDate(2),
      isOverdue: false,
    },
  });

  const task3_3 = await prisma.task.create({
    data: {
      title: 'Appointment booking system',
      description: 'Full appointment scheduling with provider availability, calendar integration, automated reminders (SMS/email), and cancellation handling.',
      projectId: project3.id,
      assignedDeveloperId: dev1.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: futureDate(8),
      isOverdue: false,
    },
  });

  const task3_4 = await prisma.task.create({
    data: {
      title: 'Medical records viewer',
      description: 'Secure medical records access with PDF/DICOM viewer, download capability, sharing with authorized providers, and access audit trail.',
      projectId: project3.id,
      assignedDeveloperId: dev2.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: futureDate(18),
      isOverdue: false,
    },
  });

  const task3_5 = await prisma.task.create({
    data: {
      title: 'Telemedicine video consultation module',
      description: 'WebRTC-based video consultation with waiting room, screen sharing, session recording (with consent), and post-appointment notes.',
      projectId: project3.id,
      assignedDeveloperId: dev3.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate(25),
      isOverdue: false,
    },
  });

  const task3_6 = await prisma.task.create({
    data: {
      title: 'Prescription tracking and refill requests',
      description: 'Medication management module with refill requests, pharmacy integration, dosage reminders, and drug interaction warnings.',
      projectId: project3.id,
      assignedDeveloperId: dev4.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate(35),
      isOverdue: false,
    },
  });

  console.log('✅ Created 6 tasks for Project 3');

  // ============================================================
  // TASKS — Project 4: TechnoVate Mobile App
  // ============================================================
  const task4_1 = await prisma.task.create({
    data: {
      title: 'React Native project setup and architecture',
      description: 'Initialize React Native project with TypeScript, navigation structure, state management, and CI/CD for both iOS and Android builds.',
      projectId: project4.id,
      assignedDeveloperId: dev2.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: pastDate(30),
      isOverdue: false,
    },
  });

  const task4_2 = await prisma.task.create({
    data: {
      title: 'Mobile API client and authentication',
      description: 'Implement secure API communication layer with JWT handling, biometric authentication, and offline token storage.',
      projectId: project4.id,
      assignedDeveloperId: dev1.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: futureDate(5),
      isOverdue: false,
    },
  });

  const task4_3 = await prisma.task.create({
    data: {
      title: 'Product browsing and search screens',
      description: 'Build native product listing, search, and detail screens with smooth animations and optimistic updates.',
      projectId: project4.id,
      assignedDeveloperId: dev3.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate(15),
      isOverdue: false,
    },
  });

  const task4_4 = await prisma.task.create({
    data: {
      title: 'Push notification integration',
      description: 'Firebase Cloud Messaging integration for order updates, promotions, and price drop alerts with deep linking.',
      projectId: project4.id,
      assignedDeveloperId: dev4.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate(20),
      isOverdue: false,
    },
  });

  const task4_5 = await prisma.task.create({
    data: {
      title: 'Checkout flow and payment integration',
      description: 'Mobile checkout with Apple Pay, Google Pay, and Stripe card payment. Implement 3D Secure and PCI compliance.',
      projectId: project4.id,
      assignedDeveloperId: dev2.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: futureDate(25),
      isOverdue: false,
    },
  });

  console.log('✅ Created 5 tasks for Project 4');

  // ============================================================
  // ACTIVITY LOGS (pre-seeded history)
  // ============================================================

  // Project 1 activities
  const activitiesToCreate = [
    {
      projectId: project1.id,
      taskId: task1_1.id,
      userId: dev1.id,
      type: ActivityType.TASK_CREATED,
      description: `Ravi Patel created task "Design database schema for product catalog"`,
      createdAt: pastDate(20),
    },
    {
      projectId: project1.id,
      taskId: task1_1.id,
      userId: dev1.id,
      type: ActivityType.TASK_STATUS_CHANGED,
      oldStatus: TaskStatus.TODO,
      newStatus: TaskStatus.IN_PROGRESS,
      description: `Ravi Patel started "Design database schema for product catalog"`,
      createdAt: pastDate(18),
    },
    {
      projectId: project1.id,
      taskId: task1_1.id,
      userId: dev1.id,
      type: ActivityType.TASK_STATUS_CHANGED,
      oldStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.IN_REVIEW,
      description: `Ravi Patel submitted "Design database schema for product catalog" for review`,
      createdAt: pastDate(12),
    },
    {
      projectId: project1.id,
      taskId: task1_1.id,
      userId: pm1.id,
      type: ActivityType.TASK_STATUS_CHANGED,
      oldStatus: TaskStatus.IN_REVIEW,
      newStatus: TaskStatus.DONE,
      description: `Sarah Mitchell approved and closed "Design database schema for product catalog"`,
      createdAt: pastDate(10),
    },
    {
      projectId: project1.id,
      taskId: task1_2.id,
      userId: dev2.id,
      type: ActivityType.TASK_CREATED,
      description: `Emma Watson created task "Implement user authentication and authorization"`,
      createdAt: pastDate(15),
    },
    {
      projectId: project1.id,
      taskId: task1_2.id,
      userId: dev2.id,
      type: ActivityType.TASK_STATUS_CHANGED,
      oldStatus: TaskStatus.TODO,
      newStatus: TaskStatus.IN_PROGRESS,
      description: `Emma Watson started "Implement user authentication and authorization"`,
      createdAt: pastDate(12),
    },
    {
      projectId: project1.id,
      taskId: task1_2.id,
      userId: dev2.id,
      type: ActivityType.TASK_STATUS_CHANGED,
      oldStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.DONE,
      description: `Emma Watson completed "Implement user authentication and authorization"`,
      createdAt: pastDate(7),
    },
    {
      projectId: project1.id,
      taskId: task1_3.id,
      userId: dev1.id,
      type: ActivityType.TASK_STATUS_CHANGED,
      oldStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.IN_REVIEW,
      description: `Ravi Patel submitted "Build product listing and search API" for review`,
      createdAt: pastDate(1),
    },
    // Project 2 activities
    {
      projectId: project2.id,
      taskId: task2_6.id,
      userId: dev2.id,
      type: ActivityType.TASK_STATUS_CHANGED,
      oldStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.DONE,
      description: `Emma Watson completed "Setup CI/CD pipeline and staging environment"`,
      createdAt: pastDate(14),
    },
    {
      projectId: project2.id,
      taskId: task2_3.id,
      userId: dev3.id,
      type: ActivityType.TASK_STATUS_CHANGED,
      oldStatus: TaskStatus.TODO,
      newStatus: TaskStatus.IN_PROGRESS,
      description: `Carlos Mendez started "Social media API integrations"`,
      createdAt: pastDate(8),
    },
    // Project 3 activities
    {
      projectId: project3.id,
      taskId: task3_1.id,
      userId: dev3.id,
      type: ActivityType.TASK_STATUS_CHANGED,
      oldStatus: TaskStatus.IN_REVIEW,
      newStatus: TaskStatus.DONE,
      description: `Carlos Mendez completed HIPAA compliance architecture review`,
      createdAt: pastDate(20),
    },
    {
      projectId: project3.id,
      taskId: task3_2.id,
      userId: dev4.id,
      type: ActivityType.TASK_STATUS_CHANGED,
      oldStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.IN_REVIEW,
      description: `Aisha Johnson submitted "Patient authentication and MFA" for review`,
      createdAt: pastDate(2),
    },
  ];

  for (const activity of activitiesToCreate) {
    await prisma.activityLog.create({ data: activity as any });
  }

  console.log(`✅ Created ${activitiesToCreate.length} activity log entries`);

  // ============================================================
  // NOTIFICATIONS (pre-seeded)
  // ============================================================
  await prisma.notification.createMany({
    data: [
      {
        userId: dev1.id,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New Task Assigned',
        message: 'You have been assigned to "Build product listing and search API" in TechnoVate E-Commerce Platform.',
        isRead: true,
        readAt: pastDate(5),
      },
      {
        userId: dev4.id,
        type: NotificationType.TASK_OVERDUE,
        title: 'Task Overdue',
        message: '"Implement real-time inventory tracking" is overdue. Please update the status or contact your project manager.',
        isRead: false,
      },
      {
        userId: pm1.id,
        type: NotificationType.TASK_STATUS_CHANGED,
        title: 'Task Ready for Review',
        message: 'Ravi Patel moved "Build product listing and search API" to In Review.',
        isRead: false,
      },
      {
        userId: pm1.id,
        type: NotificationType.TASK_STATUS_CHANGED,
        title: 'Task Ready for Review',
        message: 'Emma Watson submitted "Implement user authentication and authorization" for review.',
        isRead: true,
        readAt: pastDate(6),
      },
      {
        userId: dev3.id,
        type: NotificationType.TASK_OVERDUE,
        title: 'Task Overdue',
        message: '"Social media API integrations" is overdue. Please update the project manager on your progress.',
        isRead: false,
      },
      {
        userId: pm2.id,
        type: NotificationType.TASK_STATUS_CHANGED,
        title: 'Task Ready for Review',
        message: 'Aisha Johnson moved "Patient authentication and MFA" to In Review.',
        isRead: false,
      },
    ],
  });

  console.log('✅ Created sample notifications');

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('                 SEED CREDENTIALS                      ');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ADMIN:                                               ');
  console.log('    Email:    admin@velozity.dev                       ');
  console.log('    Password: Admin123!                                ');
  console.log('                                                       ');
  console.log('  PROJECT MANAGERS:                                    ');
  console.log('    Email:    pm1@velozity.dev  / pm2@velozity.dev     ');
  console.log('    Password: Manager123!                              ');
  console.log('                                                       ');
  console.log('  DEVELOPERS:                                          ');
  console.log('    Email:    dev1@velozity.dev  (Ravi Patel)          ');
  console.log('    Email:    dev2@velozity.dev  (Emma Watson)         ');
  console.log('    Email:    dev3@velozity.dev  (Carlos Mendez)       ');
  console.log('    Email:    dev4@velozity.dev  (Aisha Johnson)       ');
  console.log('    Password: Dev123!                                  ');
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
