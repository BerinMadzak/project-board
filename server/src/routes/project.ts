import { Router, Request, Response } from "express";
import prisma from "../db/prisma-client";
import { authMiddleware } from "../middleware/auth-middleware";
import { body, validationResult } from "express-validator";

const projectRouter = Router();

projectRouter.use(authMiddleware);

projectRouter.get('/', async (req: Request, res: Response) => {
    const user = req.user;

    try {
        const projects = await prisma.project.findMany({
            where: { ownerId: user!.id },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json(projects);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching projects", error });
    }
});

projectRouter.post(
    '/',
    [
        body("name").isString().notEmpty().withMessage("Name is required")
    ],
    async (req: Request, res: Response) => {
        const user = req.user;

        const errors = validationResult(req);
        if(errors.isEmpty()) {
            try {
                const { name, description, color } = req.body;
                console.log("Creating project with data:", { name, description, color, ownerId: user?.id });
                const project = await prisma.project.create({
                    data: {
                        name,
                        description,
                        color,
                        ownerId: user!.id
                    }
                });
                return res.status(200).json(project);
            } catch (error) {
                return res.status(500).json({ message: "Error creating project", error });
            }
        }

        return res.status(400).json({ errors: errors.array() });
    }
);

projectRouter.put(
    '/:id', 
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if(errors.isEmpty()) {
            try {
                const { id } = req.params;
                const { name, description, color } = req.body;
                const userId = req.user!.id;
                const project = await prisma.project.update({
                    where: { id: id as string, ownerId: userId },
                    data: {
                        name,
                        description,
                        color
                    }
                });
                return res.status(200).json(project);
            } catch (error) {
                return res.status(500).json({ message: "Error updating project", error });
            }
        }

        return res.status(400).json({ errors: errors.array() });
    }
);

projectRouter.delete('/:id', async (req: Request, res: Response) => {
    const id = req.params?.id;
    const userId = req.user!.id;

    try {
        const deleteResult = await prisma.project.deleteMany({
            where: { id: id as string, ownerId: userId }
        });

        if (deleteResult.count === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        return res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting project", error });
    }
});

export default projectRouter;