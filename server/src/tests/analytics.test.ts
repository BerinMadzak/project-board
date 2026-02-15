jest.mock("../socket/socket", () => ({
  getIO: () => ({ to: () => ({ emit: () => {} }) }),
}));

import { api, createTestUser, deleteTestUser } from "./helpers";
import prisma from "../db/prisma-client";

describe("Analytics API — GET /api/analytics/project/:projectId", () => {
  let token: string;
  let userId: string;
  let projectId: string;

  beforeAll(async () => {
    const { user, token: t } = await createTestUser();
    userId = user.id;
    token = t;

    const projectRes = await api
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Analytics Test Project" });

    projectId = projectRes.body.id;
  });

  afterAll(async () => {
    await prisma.project
      .deleteMany({ where: { id: projectId } })
      .catch(() => {});
    await deleteTestUser(userId);
  });

  it("returns 401 without a token", async () => {
    const res = await api.get(`/api/analytics/project/${projectId}`);
    expect(res.status).toBe(401);
  });

  it("returns the correct shape for an empty project", async () => {
    const res = await api
      .get(`/api/analytics/project/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    expect(res.body).toHaveProperty("stats");
    expect(res.body).toHaveProperty("completionData");
    expect(res.body).toHaveProperty("tasks");

    expect(res.body.stats.total).toBe(0);
    expect(res.body.stats.completed).toBe(0);
    expect(res.body.stats.inProgress).toBe(0);
    expect(res.body.stats.overdue).toBe(0);

    expect(Array.isArray(res.body.completionData)).toBe(true);
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });

  it("reflects tasks after they are created", async () => {
    await api
      .post(`/api/tasks/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Open Task", status: "TODO", priority: "LOW" });

    await api
      .post(`/api/tasks/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Done Task", status: "DONE", priority: "HIGH" });

    const res = await api
      .get(`/api/analytics/project/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.stats.total).toBe(2);
    expect(res.body.stats.completed).toBe(1);

    expect(res.body.tasks).toHaveLength(2);
    expect(res.body.tasks[0]).toHaveProperty("title");
    expect(res.body.tasks[0]).toHaveProperty("status");
    expect(res.body.tasks[0]).not.toHaveProperty("id");
  });

  it("counts overdue tasks correctly", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await api
      .post(`/api/tasks/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Overdue Task",
        status: "TODO",
        priority: "HIGH",
        dueDate: yesterday.toISOString(),
      });

    const res = await api
      .get(`/api/analytics/project/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.stats.overdue).toBeGreaterThanOrEqual(1);
  });
});
