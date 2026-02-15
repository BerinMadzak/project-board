jest.mock("../socket/socket", () => ({
  getIO: () => ({
    to: () => ({ emit: () => {} }),
  }),
}));

import { api, createTestUser, deleteTestUser } from "./helpers";
import prisma from "../db/prisma-client";

describe("Tasks API", () => {
  let token: string;
  let userId: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    const { user, token: t } = await createTestUser();
    userId = user.id;
    token = t;

    const projectRes = await api
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Task Test Project" });

    projectId = projectRes.body.id;
  });

  afterAll(async () => {
    await prisma.project
      .deleteMany({ where: { id: projectId } })
      .catch(() => {});
    await deleteTestUser(userId);
  });

  it("POST /api/tasks/:projectId — creates a task", async () => {
    const res = await api
      .post(`/api/tasks/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My First Task", status: "TODO", priority: "MEDIUM" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("My First Task");
    expect(res.body.projectId).toBe(projectId);

    taskId = res.body.id;
  });

  it("GET /api/tasks/:projectId — returns tasks for the project", async () => {
    const res = await api
      .get(`/api/tasks/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((t: { id: string }) => t.id === taskId)).toBe(true);
  });

  it("PATCH /api/tasks/:id — updates a task status", async () => {
    const res = await api
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "IN_PROGRESS" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("IN_PROGRESS");
  });

  it("DELETE /api/tasks/:id — deletes a task", async () => {
    const res = await api
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("POST /api/tasks/:projectId — returns 400 with missing title", async () => {
    const res = await api
      .post(`/api/tasks/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "TODO" });

    expect(res.status).toBe(400);
  });
});
