import { Router, Request, Response } from "express";
import prisma from "../db/prisma-client";
import { authMiddleware } from "../middleware/auth-middleware";
import { body, validationResult } from "express-validator";
import { TaskStatus, TaskPriority } from "../db/prisma-client";
import { getIO } from "../socket/socket";

const taskRouter = Router();

taskRouter.use(authMiddleware);

taskRouter.get("/:projectId", async (req: Request, res: Response) => {
  const user = req.user;

  const projectId = req.params?.projectId;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId as string,
        project: {
          OR: [
            { ownerId: user!.id },
            { members: { some: { userId: user!.id } } },
          ],
        },
      },
      orderBy: { order: "asc" },
    });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching tasks" });
  }
});

taskRouter.post(
  "/:projectId",
  [
    body("title").isString().notEmpty().withMessage("Title is required"),
    body("description")
      .optional({ values: "falsy" })
      .isString()
      .withMessage("Description must be a string"),
    body("status")
      .optional({ values: "falsy" })
      .isIn(Object.values(TaskStatus))
      .withMessage("Invalid status"),
    body("priority")
      .optional({ values: "falsy" })
      .isIn(Object.values(TaskPriority))
      .withMessage("Invalid priority"),
    body("dueDate")
      .optional({ values: "falsy" })
      .isISO8601()
      .withMessage("Due date must be a valid date"),
    body("assigneeId")
      .optional({ values: "falsy" })
      .isString()
      .withMessage("Assignee ID must be a string"),
  ],
  async (req: Request, res: Response) => {
    const user = req.user;

    const projectId = req.params?.projectId;

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const project = await prisma.project.findFirst({
          where: {
            id: projectId as string,
            OR: [
              { ownerId: user!.id },
              { members: { some: { userId: user!.id } } },
            ],
          },
        });

        if (!project) {
          return res.status(403).json({ message: "Forbidden" });
        }

        const { title, description, status, priority, dueDate, assigneeId } =
          req.body;
        const task = await prisma.task.create({
          data: {
            title: title,
            description: description,
            status: status,
            priority: priority,
            dueDate: dueDate ? new Date(dueDate) : null,
            projectId: projectId as string,
            assigneeId: assigneeId || null,
            createdById: user!.id,
          },
        });
        getIO().to(`project:${projectId}`).emit("task:created", task);

        return res.status(200).json(task);
      } catch (error) {
        return res.status(500).json({ message: "Error creating task" });
      }
    }

    return res.status(400).json({ errors: errors.array() });
  },
);

taskRouter.patch(
  "/:id",
  [
    body("title")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Title cannot be empty"),
    body("description")
      .optional({ values: "falsy" })
      .isString()
      .withMessage("Description must be a string"),
    body("dueDate")
      .optional({ values: "falsy" })
      .isISO8601()
      .withMessage("Invalid due date format"),
    body("status")
      .optional()
      .isIn(Object.values(TaskStatus))
      .withMessage("Invalid status"),
    body("priority")
      .optional()
      .isIn(Object.values(TaskPriority))
      .withMessage("Invalid priority"),
    body("assigneeId")
      .optional({ values: "falsy" })
      .isString()
      .withMessage("assigneeId must be a string"),
    body("order").optional().isFloat().withMessage("Order must be a number"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const { id } = req.params;
        const userId = req.user!.id;

        const task = await prisma.task.update({
          where: {
            id: id as string,
            project: {
              OR: [
                { ownerId: userId },
                { members: { some: { userId: userId } } },
              ],
            },
          },
          data: {
            ...req.body,
            dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
            assigneeId: req.body.assigneeId || null,
          },
        });
        getIO().to(`project:${task.projectId}`).emit("task:updated", task);
        return res.status(200).json(task);
      } catch (error) {
        return res.status(500).json({ message: "Error updating task" });
      }
    }

    return res.status(400).json({ errors: errors.array() });
  },
);

taskRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user!.id;

  try {
    const task = await prisma.task.findFirst({
      where: {
        id: id as string,
        project: {
          OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }],
        },
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await prisma.task.delete({ where: { id: task.id } });

    getIO()
      .to(`project:${task.projectId}`)
      .emit("task:deleted", { id: task.id, projectId: task.projectId });

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting task" });
  }
});

export default taskRouter;
