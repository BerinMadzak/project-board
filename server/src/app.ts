import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import projectRouter from "./routes/project";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);

app.get("/api/health", (_, res) => {
  res.status(200).send("OK");
});

export default app;
