import { api, createTestUser, deleteTestUser } from "./helpers";
import prisma from "../db/prisma-client";

describe("Projects API", () => {
  let token: string;
  let userId: string;
  let projectId: string;

  beforeAll(async () => {
    const { user, token: t } = await createTestUser();
    userId = user.id;
    token = t;
  });

  afterAll(async () => {
    if (projectId) {
      await prisma.project.deleteMany({ where: { id: projectId } }).catch(() => {});
    }
    await deleteTestUser(userId);
  });

  it("GET /api/projects — returns 401 without a token", async () => {
    const res = await api.get("/api/projects");
    expect(res.status).toBe(401);
  });

  it("POST /api/projects — creates a project", async () => {
    const res = await api
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Project", description: "A test project" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Test Project");
    expect(res.body.ownerId).toBe(userId);

    projectId = res.body.id; 
  });

  it("GET /api/projects — returns the created project", async () => {
    const res = await api
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((p: { id: string }) => p.id === projectId)).toBe(true);
  });

  it("PUT /api/projects/:id — updates the project name", async () => {
    const res = await api
      .put(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Project Name" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Project Name");
  });

  it("DELETE /api/projects/:id — deletes the project", async () => {
    const res = await api
      .delete(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    projectId = ""; 
  });
});