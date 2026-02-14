import { Router, Request, Response } from "express";
import prisma from "../db/prisma-client";
import { authMiddleware } from "../middleware/auth-middleware";
import { body, validationResult } from "express-validator";

const projectRouter = Router();

projectRouter.use(authMiddleware);

projectRouter.get("/", async (req: Request, res: Response) => {
  const user = req.user;

  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user!.id },
          { members: { some: { userId: user!.id } } },
        ],
      },
      include: {
        owner: true,
        members: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching projects", error });
  }
});

projectRouter.post(
  "/",
  [
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("description")
      .optional({ values: "falsy" })
      .isString()
      .withMessage("Description must be a string"),
    body("color")
      .optional({ values: "falsy" })
      .isHexColor()
      .withMessage("Invalid color format"),
  ],
  async (req: Request, res: Response) => {
    const user = req.user;

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const { name, description, color } = req.body;
        console.log("Creating project with data:", {
          name,
          description,
          color,
          ownerId: user?.id,
        });
        const project = await prisma.project.create({
          data: {
            name,
            description,
            color,
            ownerId: user!.id,
          },
        });
        return res.status(200).json(project);
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error creating project", error });
      }
    }

    return res.status(400).json({ errors: errors.array() });
  },
);

projectRouter.put(
  "/:id",
  [
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("description")
      .optional({ values: "falsy" })
      .isString()
      .withMessage("Description must be a string"),
    body("color")
      .optional({ values: "falsy" })
      .isHexColor()
      .withMessage("Invalid color format"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const { id } = req.params;
        const { name, description, color } = req.body;
        const userId = req.user!.id;
        const project = await prisma.project.update({
          where: { id: id as string, ownerId: userId },
          data: {
            name,
            description,
            color,
          },
        });
        return res.status(200).json(project);
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error updating project", error });
      }
    }

    return res.status(400).json({ errors: errors.array() });
  },
);

projectRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params?.id;
  const userId = req.user!.id;

  try {
    const deleteResult = await prisma.project.deleteMany({
      where: { id: id as string, ownerId: userId },
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting project", error });
  }
});

projectRouter.post(
  "/:id/members/add",
  [
    body('email').isEmail().withMessage("Email is not valid")
  ],
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email } = req.body;
    const currentUserId = req.user!.id;

    try {
      const project = await prisma.project.findUnique({ where: { id: id as string } });
      if(!project || project.ownerId !== currentUserId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const targetUser = await prisma.user.findUnique({ where: { email } });
      if(!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if(targetUser.id === currentUserId) {
        return res.status(400).json({ message: "User is the owner of the project" });
      }

      const member = await prisma.projectMember.create({
        data: {
          projectId: id as string,
          userId: targetUser.id,
          role: "MEMBER"
        },
        include: {
          user: true
        }
      });

      return res.status(200).json(member);
    } catch (error: any) {
      if(error.code === "P2002") {
        return res.status(400).json({ message: "User is already a member of the project" });
      }

      return res.status(500).json({ message: "Error adding member", error });
    }
  }
);

projectRouter.delete(
  "/:id/members/:userId",
  async (req: Request, res: Response) => {
    const { id, userId } = req.params;
    const currentUserId = req.user!.id;

    try {
      const project = await prisma.project.findUnique({ where: { id: id as string } });
      if (!project || project.ownerId !== currentUserId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (userId === currentUserId) {
        return res
          .status(400)
          .json({ message: "Owner cannot be removed from the project" });
      }

      const deleted = await prisma.projectMember.deleteMany({
        where: { projectId: id as string, userId: userId as string },
      });

      if (deleted.count === 0) {
        return res.status(404).json({ message: "Member not found" });
      }

      return res.status(200).json({ message: "Member removed successfully", userId });
    } catch (error) {
      return res.status(500).json({ message: "Error removing member", error });
    }
  }
);

export default projectRouter;
