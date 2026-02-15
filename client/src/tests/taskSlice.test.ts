import { describe, it, expect } from "vitest";
import taskReducer, {
  moveTask,
  taskCreated,
  taskUpdated,
  taskDeleted,
} from "../store/slices/taskSlice";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} from "../store/slices/taskSlice";
import type { Task } from "../store/slices/taskSlice";

function makeTask(overrides?: Partial<Task>): Task {
  return {
    id: "t1",
    title: "Fix bug",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: null,
    projectId: "p1",
    assigneeId: null,
    createdById: "u1",
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const emptyState = { tasks: [], loading: false, updatingId: null, error: null };

const task1 = makeTask({ id: "t1", title: "Task One", order: 1 });
const task2 = makeTask({ id: "t2", title: "Task Two", order: 2 });
const loadedState = {
  tasks: [task1, task2],
  loading: false,
  updatingId: null,
  error: null,
};

describe("taskSlice — taskCreated (socket event)", () => {
  it("adds a new task to the list", () => {
    const newTask = makeTask({ id: "t3", title: "New Task", order: 3 });
    const state = taskReducer(emptyState, taskCreated(newTask));
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].id).toBe("t3");
  });

  it("does not add a duplicate task", () => {
    const state = taskReducer(loadedState, taskCreated(task1));
    expect(state.tasks).toHaveLength(2);
  });

  it("sorts tasks by order after insertion", () => {
    const outOfOrderTask = makeTask({
      id: "t0",
      title: "First Task",
      order: 0,
    });
    const state = taskReducer(loadedState, taskCreated(outOfOrderTask));
    expect(state.tasks[0].id).toBe("t0");
  });
});

describe("taskSlice — taskUpdated (socket event)", () => {
  it("replaces the task in the list", () => {
    const updated = { ...task1, title: "Task One Updated", status: "DONE" };
    const state = taskReducer(loadedState, taskUpdated(updated));
    expect(state.tasks.find((t) => t.id === "t1")?.title).toBe(
      "Task One Updated",
    );
    expect(state.tasks.find((t) => t.id === "t1")?.status).toBe("DONE");
  });

  it("does not change the list if task id is not found", () => {
    const ghost = makeTask({ id: "t999", title: "Ghost" });
    const state = taskReducer(loadedState, taskUpdated(ghost));
    expect(state.tasks).toHaveLength(2);
    expect(state.tasks.find((t) => t.id === "t999")).toBeUndefined();
  });
});

describe("taskSlice — taskDeleted (socket event)", () => {
  it("removes the task from the list", () => {
    const state = taskReducer(loadedState, taskDeleted("t1"));
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].id).toBe("t2");
  });
});

describe("taskSlice — moveTask", () => {
  it("changes the status of a task", () => {
    const state = taskReducer(
      loadedState,
      moveTask({ taskId: "t1", status: "IN_PROGRESS" }),
    );
    expect(state.tasks.find((t) => t.id === "t1")?.status).toBe("IN_PROGRESS");
  });

  it("reorders tasks when overId is provided", () => {
    const state = taskReducer(
      loadedState,
      moveTask({ taskId: "t1", status: "TODO", overId: "t2" }),
    );

    expect(state.tasks[0].id).toBe("t2");
    expect(state.tasks[1].id).toBe("t1");
  });

  it("does nothing if taskId is not found", () => {
    const state = taskReducer(
      loadedState,
      moveTask({ taskId: "t999", status: "DONE" }),
    );

    expect(state.tasks[0].status).toBe("TODO");
    expect(state.tasks[1].status).toBe("TODO");
  });
});

describe("taskSlice — getTasks", () => {
  it("sets loading true on pending", () => {
    const state = taskReducer(
      emptyState,
      getTasks.pending("", { projectId: "p1" }),
    );
    expect(state.loading).toBe(true);
  });

  it("merges new tasks without losing existing ones from other projects", () => {
    const otherTask = makeTask({ id: "t_other", projectId: "p2" });
    const stateWithBoth = { ...emptyState, tasks: [task1, otherTask] };

    const freshTask = makeTask({
      id: "t1",
      title: "Task One Refreshed",
      projectId: "p1",
    });
    const state = taskReducer(
      stateWithBoth,
      getTasks.fulfilled([freshTask], "", { projectId: "p1" }),
    );

    expect(state.tasks).toHaveLength(2);
    expect(state.tasks.find((t) => t.id === "t_other")).toBeDefined();
    expect(state.tasks.find((t) => t.id === "t1")?.title).toBe(
      "Task One Refreshed",
    );
  });

  it("stores error on rejected", () => {
    const state = taskReducer(
      emptyState,
      getTasks.rejected(null, "", { projectId: "p1" }, "Network error"),
    );
    expect(state.error).toBe("Network error");
    expect(state.loading).toBe(false);
  });
});

describe("taskSlice — addTask", () => {
  const addArgs = {
    title: "New",
    description: "",
    status: "TODO",
    priority: "LOW",
    dueDate: null,
    projectId: "p1",
    assigneeId: null,
  };

  it("appends task on fulfilled", () => {
    const newTask = makeTask({ id: "t3", title: "New" });
    const state = taskReducer(
      emptyState,
      addTask.fulfilled(newTask, "", addArgs),
    );
    expect(state.tasks).toHaveLength(1);
  });

  it("does not duplicate if task already exists (guard against socket race)", () => {
    const stateWithTask = { ...emptyState, tasks: [task1] };
    const state = taskReducer(
      stateWithTask,
      addTask.fulfilled(task1, "", addArgs),
    );
    expect(state.tasks).toHaveLength(1);
  });
});

describe("taskSlice — updateTask", () => {
  it("sets updatingId on pending", () => {
    const state = taskReducer(
      loadedState,
      updateTask.pending("", {
        id: "t1",
        title: "",
        description: "",
        status: "",
        priority: "",
        dueDate: null,
        projectId: "p1",
        assigneeId: null,
        order: null,
      }),
    );
    expect(state.updatingId).toBe("t1");
  });

  it("clears updatingId and updates task on fulfilled", () => {
    const updated = { ...task1, status: "DONE" };
    const pendingState = { ...loadedState, updatingId: "t1" };
    const state = taskReducer(
      pendingState,
      updateTask.fulfilled(updated, "", {
        id: "t1",
        title: "",
        description: "",
        status: "DONE",
        priority: "",
        dueDate: null,
        projectId: "p1",
        assigneeId: null,
        order: null,
      }),
    );
    expect(state.updatingId).toBeNull();
    expect(state.tasks.find((t) => t.id === "t1")?.status).toBe("DONE");
  });
});

describe("taskSlice — deleteTask", () => {
  it("removes the task on fulfilled", () => {
    const state = taskReducer(
      loadedState,
      deleteTask.fulfilled("t1", "", { id: "t1" }),
    );
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks.find((t) => t.id === "t1")).toBeUndefined();
  });
});
