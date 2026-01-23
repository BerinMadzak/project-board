import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import prisma from "../db/prisma-client";
import bcrypt from "bcrypt";

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
        return emailExists;
      })
      .withMessage("Email already exists"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("name").isString().isEmpty().withMessage("Name is required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const passwordHash = await bcrypt.hash(req.body.password, 10);
      await prisma.user.create({
        data: {
          email: req.body.email,
          passwordHash: passwordHash,
          name: req.body.name,
          role: "MEMBER",
        },
      });
      return res.status(201).json({ message: "User created successfully" });
    }

    return res.status(400).json({ errors: errors.array() });
  },
);

export default authRouter;
