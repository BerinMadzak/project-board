import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import projectRouter from "./routes/project";
import taskRouter from "./routes/task";
import analyticsRouter from "./routes/analytics";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/analytics", analyticsRouter);

app.get("/api/health", (_, res) => {
  res.status(200).send("OK");
});

export default app;
