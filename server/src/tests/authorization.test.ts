jest.mock("../socket/socket", () => ({
  getIO: () => ({ to: () => ({ emit: () => {} }) }),
}));

import { api, clearDatabase, createTestUser } from "./helpers";

describe("Authorization boundaries", () => {
  let ownerToken: string;
  let memberToken: string;
  let outsiderToken: string;
  let projectId: string;
  let taskId: string;
  let memberId: string;

  beforeAll(async () => {
    await clearDatabase();

    const { token: ot } = await createTestUser();
    const { user: member, token: mt } = await createTestUser();
    const { token: st } = await createTestUser();

    ownerToken = ot;
    memberToken = mt;
    outsiderToken = st;
    memberId = member.id;

    const projectRes = await api
      .post("/api/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Auth Test Project" });
    projectId = projectRes.body.id;

    await api
      .post(`/api/projects/${projectId}/members/add`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ email: member.email });

    const taskRes = await api
      .post(`/api/tasks/${projectId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ title: "Auth Test Task", status: "TODO", priority: "MEDIUM" });
    taskId = taskRes.body.id;
  });

  describe("Project access", () => {
    it("outsider cannot update a project they do not own", async () => {
      const res = await api
        .put(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${outsiderToken}`)
        .send({ name: "Hacked Name" });

      expect(res.status).toBe(403);
    });

    it("member cannot update a project they do not own", async () => {
      const res = await api
        .put(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ name: "Hacked Name" });

      expect(res.status).toBe(403);
    });

    it("outsider cannot delete a project they do not own", async () => {
      const res = await api
        .delete(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(404);
    });

    it("member cannot delete a project they do not own", async () => {
      const res = await api
        .delete(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("Member management", () => {
    it("outsider cannot add members to a project", async () => {
      const res = await api
        .post(`/api/projects/${projectId}/members/add`)
        .set("Authorization", `Bearer ${outsiderToken}`)
        .send({ email: "anyone@test.com" });

      expect(res.status).toBe(403);
    });

    it("member cannot add members to a project they don't own", async () => {
      const res = await api
        .post(`/api/projects/${projectId}/members/add`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ email: "anyone@test.com" });

      expect(res.status).toBe(403);
    });

    it("outsider cannot remove members from a project", async () => {
      const res = await api
        .delete(`/api/projects/${projectId}/members/${memberId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("Task access", () => {
    it("outsider cannot create a task in a project", async () => {
      const res = await api
        .post(`/api/tasks/${projectId}`)
        .set("Authorization", `Bearer ${outsiderToken}`)
        .send({ title: "Sneaky Task", status: "TODO", priority: "LOW" });

      expect(res.status).toBe(403);
    });

    it("outsider cannot update a task", async () => {
      const res = await api
        .patch(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${outsiderToken}`)
        .send({ status: "DONE" });

      expect(res.status).toBe(403);
    });

    it("outsider cannot delete a task", async () => {
      const res = await api
        .delete(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(404);
    });

    it("member can create a task in a project they belong to", async () => {
      const res = await api
        .post(`/api/tasks/${projectId}`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ title: "Member Task", status: "TODO", priority: "LOW" });

      expect(res.status).toBe(200);
    });

    it("member can update a task in a project they belong to", async () => {
      const res = await api
        .patch(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ status: "IN_PROGRESS" });

      expect(res.status).toBe(200);
    });
  });
});
