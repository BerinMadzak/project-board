import { describe, it, expect } from "vitest";
import analyticsReducer, {
  clearAnalytics,
} from "../store/slices/analyticsSlice";
import { fetchProjectAnalytics } from "../store/slices/analyticsSlice";

const mockAnalytics = {
  stats: { total: 10, completed: 4, inProgress: 3, overdue: 1 },
  completionData: [
    { date: "Jan 1", completed: 2 },
    { date: "Jan 2", completed: 2 },
  ],
  tasks: [{ title: "Fix login", status: "DONE" }],
};

const emptyState = { data: null, loading: false, error: null };
const loadedState = { data: mockAnalytics, loading: false, error: null };

describe("analyticsSlice — clearAnalytics", () => {
  it("resets data and error to null", () => {
    const state = analyticsReducer(
      { ...loadedState, error: "old error" },
      clearAnalytics(),
    );
    expect(state.data).toBeNull();
    expect(state.error).toBeNull();
  });
});

describe("analyticsSlice — fetchProjectAnalytics", () => {
  it("sets loading true and clears error on pending", () => {
    const state = analyticsReducer(
      emptyState,
      fetchProjectAnalytics.pending("", "p1"),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("stores analytics data on fulfilled", () => {
    const state = analyticsReducer(
      emptyState,
      fetchProjectAnalytics.fulfilled(mockAnalytics, "", "p1"),
    );
    expect(state.data).toEqual(mockAnalytics);
    expect(state.data?.stats.total).toBe(10);
    expect(state.data?.stats.completed).toBe(4);
    expect(state.loading).toBe(false);
  });

  it("replaces old data when a new project is loaded", () => {
    const newAnalytics = {
      ...mockAnalytics,
      stats: { total: 5, completed: 1, inProgress: 2, overdue: 0 },
    };
    const state = analyticsReducer(
      loadedState,
      fetchProjectAnalytics.fulfilled(newAnalytics, "", "p2"),
    );
    expect(state.data?.stats.total).toBe(5);
  });

  it("stores error message on rejected", () => {
    const state = analyticsReducer(
      emptyState,
      fetchProjectAnalytics.rejected(
        null,
        "",
        "p1",
        "Error fetching analytics",
      ),
    );
    expect(state.error).toBe("Error fetching analytics");
    expect(state.loading).toBe(false);
    expect(state.data).toBeNull();
  });

  it("preserves previous data on rejected (no data wipe on refresh failure)", () => {
    const state = analyticsReducer(
      loadedState,
      fetchProjectAnalytics.rejected(null, "", "p1", "Network error"),
    );
    expect(state.data).toEqual(mockAnalytics);
    expect(state.error).toBe("Network error");
  });
});
