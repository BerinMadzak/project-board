import request from "supertest";
import app from "../app";
import prisma from "../db/prisma-client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

export const api = request(app);

export async function createTestUser(overrides?: {
  email?: string;
  username?: string;
}) {
  const nonce = randomBytes(2).toString("hex");
  const email = overrides?.email ?? `test_${Date.now()}_${nonce}@example.com`;
  const username = overrides?.username ?? `user_${Date.now()}_${nonce}`;

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash: await bcrypt.hash("password123", 10),
      role: "MEMBER",
    },
  });

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
  );

  return { user, token };
}

export async function deleteTestUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } }).catch(() => {});
}
