import "dotenv/config";
import prisma from "./prisma-client";
import bcrypt from "bcrypt";
import { type Prisma } from "../generated/prisma/client";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      username: "Alice Mercer",
      passwordHash,
      role: "MEMBER",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      username: "Bob Chen",
      passwordHash,
      role: "MEMBER",
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: {},
    create: {
      email: "carol@example.com",
      username: "Carol Davis",
      passwordHash,
      role: "MEMBER",
    },
  });

  console.log("Users created");

  const projectWeb = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description:
        "Complete overhaul of the marketing website with new branding and improved UX.",
      color: "#6366f1",
      ownerId: alice.id,
      createdAt: daysAgo(14),
    },
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: projectWeb.id, userId: bob.id, role: "MEMBER" },
      { projectId: projectWeb.id, userId: carol.id, role: "MEMBER" },
    ],
  });

  const projectApp = await prisma.project.create({
    data: {
      name: "Mobile App MVP",
      description:
        "Build and ship the first version of the iOS and Android companion app.",
      color: "#10b981",
      ownerId: bob.id,
      createdAt: daysAgo(10),
    },
  });

  await prisma.projectMember.create({
    data: { projectId: projectApp.id, userId: alice.id, role: "MEMBER" },
  });

  console.log("Projects created");

  function makeTask(
    projectId: string,
    createdById: string,
    t: Omit<Prisma.TaskUncheckedCreateInput, "projectId" | "createdById">
  ): Prisma.TaskUncheckedCreateInput {
    return { ...t, projectId, createdById };
  }

  type TaskData = Omit<
    Prisma.TaskUncheckedCreateInput,
    "projectId" | "createdById"
  >;

  const webTasks: TaskData[] = [
    {
      title: "Conduct stakeholder interviews",
      description: "Gather requirements from marketing and sales teams.",
      status: "DONE",
      priority: "HIGH",
      dueDate: daysAgo(12),
      assigneeId: alice.id,
      createdAt: daysAgo(14),
      updatedAt: daysAgo(12),
      order: 100,
    },
    {
      title: "Create wireframes for homepage",
      description: "Low-fidelity wireframes covering hero, features, and CTA.",
      status: "DONE",
      priority: "HIGH",
      dueDate: daysAgo(10),
      assigneeId: carol.id,
      createdAt: daysAgo(13),
      updatedAt: daysAgo(10),
      order: 200,
    },
    {
      title: "Audit existing brand assets",
      description: "Catalogue all logos, fonts, and colour values in use.",
      status: "DONE",
      priority: "LOW",
      dueDate: daysAgo(10),
      assigneeId: bob.id,
      createdAt: daysAgo(13),
      updatedAt: daysAgo(10),
      order: 210,
    },
    {
      title: "Design system – colour palette & typography",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: daysAgo(9),
      assigneeId: carol.id,
      createdAt: daysAgo(12),
      updatedAt: daysAgo(9),
      order: 300,
    },
    {
      title: "Define spacing and grid tokens",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: daysAgo(9),
      assigneeId: carol.id,
      createdAt: daysAgo(12),
      updatedAt: daysAgo(9),
      order: 310,
    },
    {
      title: "Document icon library guidelines",
      status: "DONE",
      priority: "LOW",
      dueDate: daysAgo(9),
      assigneeId: alice.id,
      createdAt: daysAgo(12),
      updatedAt: daysAgo(9),
      order: 320,
    },
    {
      title: "Set up Storybook component library",
      description: "Document all shared UI components with Storybook.",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: daysAgo(7),
      assigneeId: bob.id,
      createdAt: daysAgo(11),
      updatedAt: daysAgo(7),
      order: 400,
    },
    {
      title: "Build responsive navbar",
      status: "DONE",
      priority: "HIGH",
      dueDate: daysAgo(5),
      assigneeId: bob.id,
      createdAt: daysAgo(8),
      updatedAt: daysAgo(5),
      order: 500,
    },
    {
      title: "Build footer with sitemap links",
      status: "DONE",
      priority: "LOW",
      dueDate: daysAgo(5),
      assigneeId: alice.id,
      createdAt: daysAgo(8),
      updatedAt: daysAgo(5),
      order: 510,
    },
    {
      title: "Implement hero section animation",
      description: "Framer Motion entrance animation on page load.",
      status: "DONE",
      priority: "LOW",
      dueDate: daysAgo(4),
      assigneeId: carol.id,
      createdAt: daysAgo(7),
      updatedAt: daysAgo(4),
      order: 600,
    },
    {
      title: "Build features grid section",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: daysAgo(4),
      assigneeId: bob.id,
      createdAt: daysAgo(7),
      updatedAt: daysAgo(4),
      order: 610,
    },
    {
      title: "Write copy for About page",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: daysAgo(3),
      assigneeId: alice.id,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(3),
      order: 700,
    },
    {
      title: "Write copy for homepage hero",
      status: "DONE",
      priority: "HIGH",
      dueDate: daysAgo(3),
      assigneeId: alice.id,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(3),
      order: 710,
    },
    {
      title: "Set up contact form with email delivery",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: daysAgo(3),
      assigneeId: bob.id,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(3),
      order: 720,
    },
    {
      title: "Implement cookie consent banner",
      status: "DONE",
      priority: "LOW",
      dueDate: daysAgo(2),
      assigneeId: carol.id,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(2),
      order: 800,
    },
    {
      title: "Set up sitemap.xml and robots.txt",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: daysAgo(1),
      assigneeId: bob.id,
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
      order: 900,
    },
    {
      title: "Configure custom 404 page",
      status: "DONE",
      priority: "LOW",
      dueDate: daysAgo(1),
      assigneeId: carol.id,
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
      order: 910,
    },
    {
      title: "Integrate headless CMS (Contentful)",
      description: "Connect blog and case studies to Contentful entries.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: daysFromNow(2),
      assigneeId: bob.id,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
      order: 1000,
    },
    {
      title: "Optimise images and implement lazy loading",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: daysFromNow(3),
      assigneeId: carol.id,
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
      order: 1100,
    },
    {
      title: "Accessibility audit (WCAG 2.1 AA)",
      description: "Run axe-core and fix critical issues.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: daysAgo(1),
      assigneeId: carol.id,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(2),
      order: 1200,
    },
    {
      title: "Cross-browser QA testing",
      description: "Test on Chrome, Firefox, Safari, Edge.",
      status: "TODO",
      priority: "HIGH",
      dueDate: daysFromNow(5),
      assigneeId: alice.id,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
      order: 2000,
    },
    {
      title: "Set up Google Analytics 4",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: daysFromNow(6),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
      order: 2100,
    },
    {
      title: "SEO audit and meta tag review",
      description: "Ensure all pages have proper meta descriptions and OG tags.",
      status: "TODO",
      priority: "URGENT",
      dueDate: daysAgo(2),
      assigneeId: alice.id,
      createdAt: daysAgo(8),
      updatedAt: daysAgo(8),
      order: 2200,
    },
  ];

  for (const t of webTasks) {
    await prisma.task.create({
      data: makeTask(projectWeb.id, alice.id, t),
    });
  }

  console.log("Website Redesign tasks created");

  const appTasks: TaskData[] = [
    {
      title: "Define MVP feature scope",
      status: "DONE",
      priority: "URGENT",
      dueDate: daysAgo(9),
      assigneeId: bob.id,
      createdAt: daysAgo(10),
      updatedAt: daysAgo(9),
      order: 100,
    },
    {
      title: "Set up React Native with Expo",
      status: "DONE",
      priority: "HIGH",
      dueDate: daysAgo(8),
      assigneeId: bob.id,
      createdAt: daysAgo(10),
      updatedAt: daysAgo(8),
      order: 200,
    },
    {
      title: "Design onboarding screens",
      description: "Welcome, sign up, and permissions screens.",
      status: "DONE",
      priority: "HIGH",
      dueDate: daysAgo(6),
      assigneeId: alice.id,
      createdAt: daysAgo(9),
      updatedAt: daysAgo(6),
      order: 300,
    },
    {
      title: "Set up navigation stack",
      status: "DONE",
      priority: "HIGH",
      dueDate: daysAgo(6),
      assigneeId: bob.id,
      createdAt: daysAgo(9),
      updatedAt: daysAgo(6),
      order: 310,
    },
    {
      title: "Implement auth screens (login & register)",
      status: "DONE",
      priority: "HIGH",
      dueDate: daysAgo(4),
      assigneeId: bob.id,
      createdAt: daysAgo(7),
      updatedAt: daysAgo(4),
      order: 400,
    },
    {
      title: "Design home dashboard screen",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: daysAgo(4),
      assigneeId: alice.id,
      createdAt: daysAgo(7),
      updatedAt: daysAgo(4),
      order: 410,
    },
    {
      title: "Implement push notifications",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: daysFromNow(4),
      assigneeId: bob.id,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
      order: 1000,
    },
    {
      title: "Integrate REST API client",
      status: "TODO",
      priority: "HIGH",
      dueDate: daysFromNow(3),
      assigneeId: alice.id,
      createdAt: daysAgo(4),
      updatedAt: daysAgo(4),
      order: 2000,
    },
    {
      title: "Write unit tests for auth flows",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: daysAgo(1),
      createdAt: daysAgo(7),
      updatedAt: daysAgo(7),
      order: 2100,
    },
  ];

  for (const t of appTasks) {
    await prisma.task.create({
      data: makeTask(projectApp.id, bob.id, t),
    });
  }

  console.log("Mobile App tasks created");

  const [firstWebTask] = await prisma.task.findMany({
    where: { projectId: projectWeb.id, status: "DONE" },
    take: 1,
  });

  if (firstWebTask) {
    await prisma.comment.createMany({
      data: [
        {
          content: "Great work on gathering all the feedback so quickly!",
          taskId: firstWebTask.id,
          userId: bob.id,
          createdAt: daysAgo(11),
        },
        {
          content: "Agreed – the notes from the sales team were especially helpful.",
          taskId: firstWebTask.id,
          userId: alice.id,
          createdAt: daysAgo(11),
        },
      ],
    });
  }

  console.log("Comments created");
  console.log("─────────────────────────────────────────");
  console.log("Demo accounts (password: password123):");
  console.log("  alice@example.com  – owns Website Redesign");
  console.log("  bob@example.com    – owns Mobile App MVP");
  console.log("  carol@example.com  – member on Website Redesign");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());