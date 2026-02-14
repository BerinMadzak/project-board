import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSocket } from "../services/socket";
import {
  taskCreated,
  taskDeleted,
  taskUpdated,
} from "../store/slices/taskSlice";
import type { Task } from "../store/slices/taskSlice";

export const useSocket = (projectId: string) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();

    if (!socket || !projectId) return;

    const onTaskCreated = (task: Task) => {
      console.log("Task created:", task.id);
      dispatch(taskCreated(task));
    };

    const onTaskUpdated = (task: Task) => {
      console.log("Task updated:", task.id);
      dispatch(taskUpdated(task));
    };

    const onTaskDeleted = (payload: { id: string }) => {
      console.log("Task deleted:", payload.id);
      dispatch(taskDeleted(payload.id));
    };

    const setupRoom = () => {
      console.log("Joining room:", projectId);
      socket.emit("join_project", projectId);

      socket.on("task:created", onTaskCreated);
      socket.on("task:updated", onTaskUpdated);
      socket.on("task:deleted", onTaskDeleted);
    };

    if (socket.connected) {
      setupRoom();
    }

    socket.on("connect", setupRoom);

    return () => {
      console.log("Leaving room:", projectId);
      socket.emit("leave_project", projectId);
      socket.off("connect", setupRoom);
      socket.off("task:created", onTaskCreated);
      socket.off("task:updated", onTaskUpdated);
      socket.off("task:deleted", onTaskDeleted);
    };
  }, [projectId, dispatch]);
};
