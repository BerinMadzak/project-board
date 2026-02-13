import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../services/api";
import axios from "axios";

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const loadInitialState = (): ProjectState => {
  return {
    projects: [],
    loading: false,
    error: null,
  };
};

export const getProjects = createAsyncThunk(
  "/projects/getProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/projects/`);
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

export const addProject = createAsyncThunk(
  "/projects/addProject",
  async (
    {
      name,
      description,
      color,
    }: { name: string; description: string; color: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/api/projects", {
        name,
        description,
        color,
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to add project",
        );
      }
      return rejectWithValue("Failed to add project");
    }
  },
);

export const updateProject = createAsyncThunk(
  "/projects/updateProject",
  async (
    {
      id,
      name,
      description,
      color,
    }: { id: string; name: string; description: string; color: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put(`/api/projects/${id}`, {
        name,
        description,
        color,
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to update project",
        );
      }
      return rejectWithValue("Failed to update project");
    }
  },
);

export const deleteProject = createAsyncThunk(
  "/projects/deleteProject",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/projects/${id}`);
      return id;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to delete project",
        );
      }
      return rejectWithValue("Failed to delete project");
    }
  },
);

const projectSlice = createSlice({
  name: "projects",
  initialState: loadInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getProjects.fulfilled,
        (state, action: PayloadAction<Project[]>) => {
          state.projects = action.payload;
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(getProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addProject.fulfilled,
        (state, action: PayloadAction<Project>) => {
          state.projects.push(action.payload);
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(addProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProject.fulfilled,
        (state, action: PayloadAction<Project>) => {
          const index = state.projects.findIndex(
            (project) => project.id === action.payload.id,
          );
          if (index !== -1) {
            state.projects[index] = action.payload;
          }
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteProject.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.projects = state.projects.filter(
            (project) => project.id !== action.payload,
          );
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default projectSlice.reducer;
