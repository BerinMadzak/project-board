import "dotenv/config";
import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import prisma from "../db/prisma-client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth-middleware";

const authRouter = Router();

authRouter.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Email is not valid")
      .custom(async (value) => {
        const emailExists = await prisma.user.findUnique({
          where: { email: value },
        });
        if (emailExists) {
          throw new Error("Email is already in use");
        }
        return true;
      })
      .withMessage("Email is already in use"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("username").isString().notEmpty().withMessage("Username is required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const passwordHash = await bcrypt.hash(req.body.password, 10);
        const user = await prisma.user.create({
          data: {
            email: req.body.email,
            passwordHash: passwordHash,
            username: req.body.username,
            role: "MEMBER",
          },
        });

        const token = jwt.sign(
          { id: user.id, email: user.email, username: user.username, role: user.role },
          process.env.JWT_SECRET as string,
        );

        const userData = {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        };

        return res
          .status(201)
          .json({ user: userData, token, message: "User created successfully" });
      } catch (error) {
        return res.status(500).json({ message: "Error creating user", error });
      }
    }

    return res.status(400).json({ errors: errors.array() });
  },
);

authRouter.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email is not valid"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, username: user.username, role: user.role },
          process.env.JWT_SECRET as string,
        );

        const userData = {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        };

        return res.status(200).json({ user: userData, token });
      } catch (error) {
        return res.status(500).json({ message: "Error logging in", error });
      }
    }

    return res.status(400).json({ errors: errors.array() });
  },
);

authRouter.post(
  "/validate",
  authMiddleware,
  async (req: Request, res: Response) => {
    const user = req.user;
    if (user) {
      return res.status(200).json({ user });
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }
  },
);

export default authRouter;
