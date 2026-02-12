import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../services/api";
import axios from "axios";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  projectId: string;
  assigneeId: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const loadInitialState = (): TaskState => {
  return {
    tasks: [],
    loading: false,
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
      const response = await api.delete(`/api/tasks/${id}`);
      return response.data;
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
  reducers: {},
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
        state.tasks = [...oldTasks, ...newTasks];
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
        state.tasks.push(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.tasks.findIndex(
          (task) => task.id === action.payload.id,
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteTask.fulfilled,
        (state, action: PayloadAction<{ id: string }>) => {
          state.tasks = state.tasks.filter(
            (task) => task.id !== action.payload.id,
          );
        },
      )
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default taskSlice.reducer;
