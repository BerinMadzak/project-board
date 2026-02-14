import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../services/api";
import axios from "axios";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  projectId: string;
  assigneeId: string | null;
  createdById: string;
  order: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  updatingId: string | null;
  error: string | null;
}

const loadInitialState = (): TaskState => {
  return {
    tasks: [],
    loading: false,
    updatingId: null,
    error: null,
  };
};

export const getTasks = createAsyncThunk(
  "/tasks/getTasks",
  async ({ projectId }: { projectId: string }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/tasks/${projectId}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Error fetching projects",
        );
      }
      return rejectWithValue("Error fetching projects");
    }
  },
);

export const addTask = createAsyncThunk(
  "/tasks/addTask",
  async (
    {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assigneeId,
    }: {
      title: string;
      description: string;
      status: string;
      priority: string;
      dueDate: Date | null;
      projectId: string;
      assigneeId: string | null;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post(`/api/tasks/${projectId}`, {
        title,
        description,
        status,
        priority,
        dueDate,
        assigneeId,
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to add task",
        );
      }
      return rejectWithValue("Failed to add task");
    }
  },
);

export const updateTask = createAsyncThunk(
  "/tasks/updateTask",
  async (
    {
      id,
      ...fields
    }: {
      id: string;
      title: string;
      description: string;
      status: string;
      priority: string;
      dueDate: Date | null;
      projectId: string;
      assigneeId: string | null;
      order: number | null;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(`/api/tasks/${id}`, fields);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to update task",
        );
      }
      return rejectWithValue("Failed to update task");
    }
  },
);

export const deleteTask = createAsyncThunk(
  "/tasks/deleteTask",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      return id;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to delete task",
        );
      }
      return rejectWithValue("Failed to delete task");
    }
  },
);

const taskSlice = createSlice({
  name: "tasks",
  initialState: loadInitialState(),
  reducers: {
    moveTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        status: string;
        overId?: string;
      }>,
    ) => {
      const { taskId, status: newStatus, overId } = action.payload;
      const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return;

      state.tasks[taskIndex].status = newStatus;

      if (overId && overId !== newStatus) {
        const overIndex = state.tasks.findIndex((t) => t.id === overId);
        if (overIndex !== -1 && taskIndex !== overIndex) {
          const [removed] = state.tasks.splice(taskIndex, 1);
          state.tasks.splice(overIndex, 0, removed);
        }
      }
    },
    taskCreated: (state, action: PayloadAction<Task>) => {
      const exists = state.tasks.some((t) => t.id === action.payload.id);
      if (!exists) {
        state.tasks.push(action.payload);
        state.tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    },
    taskUpdated: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
        state.tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    },
    taskDeleted: (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        const newTasks = action.payload;
        const oldTasks = state.tasks.filter(
          (task) => !newTasks.find((newTask) => newTask.id === task.id),
        );
        state.tasks = [...oldTasks, ...newTasks].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const exists = state.tasks.some((t) => t.id === action.payload.id);
        if (!exists) {
          state.tasks.push(action.payload);
          state.tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(addTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTask.pending, (state, action) => {
        state.updatingId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.tasks.findIndex(
          (task) => task.id === action.payload.id,
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
          state.tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
        state.updatingId = null;
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.updatingId = null;
        state.error = action.payload as string;
      })
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default taskSlice.reducer;
export const { moveTask, taskCreated, taskUpdated, taskDeleted } =
  taskSlice.actions;
