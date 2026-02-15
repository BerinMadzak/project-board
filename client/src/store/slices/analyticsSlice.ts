import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../services/api";

interface ProjectAnalytics {
    stats: {
        total: number;
        completed: number;
        inProgress: number;
        overdue: number;
    };
    completionData: { date: string; completed: number; }[];
    tasks: { title: string; status: string; }[];
}

interface AnalyticsState {
    data: ProjectAnalytics | null;
    loading: boolean;
    error: string | null;
}

const initialState: AnalyticsState = {
    data: null,
    loading: false,
    error: null
};

export const fetchProjectAnalytics = createAsyncThunk(
    'analytics/fetchProjectAnalytics',
    async(projectId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/analytics/project/${projectId}`);
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || "Error fetching analytics");
            }
            return rejectWithValue("Error fetching analytics");
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        clearAnalytics: (state) => {
            state.data = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjectAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjectAnalytics.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchProjectAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;

