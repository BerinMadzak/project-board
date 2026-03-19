import { api, clearDatabase, createTestUser } from "./helpers";

describe("Error Errors", () => {
  let token: string;
  let projectId: string;

  beforeAll(async () => {
    await clearDatabase();

    const { token: t } = await createTestUser();
    token = t;

    const projectRes = await api
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Error Project" });
    projectId = projectRes.body.id;
  });

  describe("POST /api/auth/register", () => {
    it("returns 400 with missing email", async () => {
      const res = await api.post("/api/auth/register").send({
        password: "password123",
        username: "testuser",
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 with missing username", async () => {
      const res = await api.post("/api/auth/register").send({
        email: "test@test.com",
        password: "password123",
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 with invalid email format", async () => {
      const res = await api.post("/api/auth/register").send({
        email: "not-an-email",
        password: "password123",
        username: "testuser",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/projects", () => {
    it("returns 400 with missing name", async () => {
      const res = await api
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({ description: "No name provided" });
      expect(res.status).toBe(400);
    });

    it("returns 400 with invalid color format", async () => {
      const res = await api
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test", color: "not-a-color" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/tasks/:projectId", () => {
    it("returns 400 with invalid status value", async () => {
      const res = await api
        .post(`/api/tasks/${projectId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Bad Task", status: "INVALID_STATUS" });
      expect(res.status).toBe(400);
    });

    it("returns 400 with invalid priority value", async () => {
      const res = await api
        .post(`/api/tasks/${projectId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Bad Task", priority: "INVALID_PRIORITY" });
      expect(res.status).toBe(400);
    });

    it("returns 400 with invalid due date format", async () => {
      const res = await api
        .post(`/api/tasks/${projectId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Bad Task", dueDate: "not-a-date" });
      expect(res.status).toBe(400);
    });

    it("returns 403 when creating a task in a non-existent project", async () => {
      const res = await api
        .post(`/api/tasks/non-existent-project-id`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Ghost Task", status: "TODO", priority: "LOW" });
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/analytics/project/:projectId", () => {
    it("returns 403 for a project the user is not a member of", async () => {
      const { token: outsiderToken } = await createTestUser();
      const res = await api
        .get(`/api/analytics/project/${projectId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);
      expect(res.status).toBe(403);
    });

    it("returns 403 for a non-existent project", async () => {
      const res = await api
        .get(`/api/analytics/project/non-existent-id`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(403);
    });
  });
});