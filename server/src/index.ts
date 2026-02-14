import dotenv from "dotenv";
import app from "./app";
import { createServer } from "http";
import { initSocket } from "./socket/socket";

dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
