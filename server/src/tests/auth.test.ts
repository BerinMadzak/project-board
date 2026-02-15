import { api, deleteTestUser } from "./helpers";

describe("POST /api/auth/register", () => {
  let createdUserId: string;

  afterEach(async () => {
    if (createdUserId) {
      await deleteTestUser(createdUserId);
      createdUserId = "";
    }
  });

  it("registers a new user and returns a token", async () => {
    const res = await api.post("/api/auth/register").send({
      email: `reg_${Date.now()}@test.com`,
      password: "password123",
      username: `reguser_${Date.now()}`,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email");
    expect(res.body.user).not.toHaveProperty("passwordHash");

    createdUserId = res.body.user.id;
  });

  it("returns 400 if email is already in use", async () => {
    const email = `dup_${Date.now()}@test.com`;

    const first = await api.post("/api/auth/register").send({
      email,
      password: "password123",
      username: `dupuser1_${Date.now()}`,
    });
    createdUserId = first.body.user.id;

    const res = await api.post("/api/auth/register").send({
      email,
      password: "password123",
      username: `dupuser2_${Date.now()}`,
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 if password is too short", async () => {
    const res = await api.post("/api/auth/register").send({
      email: `short_${Date.now()}@test.com`,
      password: "abc",
      username: `shortpw_${Date.now()}`,
    });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  let userId: string;
  const testEmail = `login_${Date.now()}@test.com`;

  beforeAll(async () => {
    const res = await api.post("/api/auth/register").send({
      email: testEmail,
      password: "password123",
      username: `loginuser_${Date.now()}`,
    });
    userId = res.body.user.id;
  });

  afterAll(async () => {
    await deleteTestUser(userId);
  });

  it("logs in with correct credentials and returns a token", async () => {
    const res = await api.post("/api/auth/login").send({
      email: testEmail,
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testEmail);
  });

  it("returns 401 with wrong password", async () => {
    const res = await api.post("/api/auth/login").send({
      email: testEmail,
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });

  it("returns 401 with non-existent email", async () => {
    const res = await api.post("/api/auth/login").send({
      email: "nobody@nowhere.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
  });
});
