import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import projectReducer, { 
  getProjects, 
  addProject, 
  updateProject, 
  deleteProject 
} from "./slices/projectSlice";
import taskReducer, { addTask, deleteTask, getTasks, updateTask } from "./slices/taskSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer
  },
});

(window as any).store = store;
(window as any).getProjects = getProjects;
(window as any).addProject = addProject;
(window as any).updateProject = updateProject;
(window as any).deleteProject = deleteProject;

(window as any).getTasks = getTasks;
(window as any).addTask = addTask;
(window as any).updateTask = updateTask;
(window as any).deleteTask = deleteTask;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
