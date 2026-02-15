import { describe, it, expect } from "vitest";
import projectReducer, { clearError } from "../store/slices/projectSlice";
import { getProjects, addProject, updateProject, deleteProject, addProjectMember, removeProjectMember } from "../store/slices/projectSlice";
import type { Project } from "../store/slices/projectSlice";

const mockUser = { id: "u1", email: "a@b.com", username: "alice", role: "MEMBER" };

const mockProject: Project = {
  id: "p1",
  name: "Alpha",
  description: "First project",
  color: "#ff0000",
  ownerId: "u1",
  owner: mockUser,
  createdAt: new Date(),
  updatedAt: new Date(),
  members: []
};

const emptyState = { projects: [], loading: false, error: null };
const loadedState = { projects: [mockProject], loading: false, error: null };

describe("projectSlice — clearError", () => {
  it("clears an existing error", () => {
    const state = projectReducer({ ...emptyState, error: "something went wrong" }, clearError());
    expect(state.error).toBeNull();
  });
});

describe("projectSlice — getProjects", () => {
  it("sets loading true on pending", () => {
    const state = projectReducer(emptyState, getProjects.pending("", undefined));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("stores projects on fulfilled", () => {
    const state = projectReducer(
      emptyState,
      getProjects.fulfilled([mockProject], "", undefined)
    );
    expect(state.projects).toHaveLength(1);
    expect(state.projects[0].id).toBe("p1");
    expect(state.loading).toBe(false);
  });

  it("stores error message on rejected", () => {
    const state = projectReducer(
      emptyState,
      getProjects.rejected(null, "", undefined, "Fetch failed")
    );
    expect(state.error).toBe("Fetch failed");
    expect(state.loading).toBe(false);
  });
});

describe("projectSlice — addProject", () => {
  it("appends the new project on fulfilled", () => {
    const newProject: Project = { ...mockProject, id: "p2", name: "Beta" };
    const state = projectReducer(
      loadedState,
      addProject.fulfilled(newProject, "", { name: "Beta", description: "", color: "" })
    );
    expect(state.projects).toHaveLength(2);
    expect(state.projects[1].name).toBe("Beta");
  });

  it("does not duplicate if the same project is added twice", () => {
    const state = projectReducer(
      emptyState,
      addProject.fulfilled(mockProject, "", { name: "Alpha", description: "", color: "" })
    );
    expect(state.projects).toHaveLength(1);
  });
});

describe("projectSlice — updateProject", () => {
  it("updates the project in the list on fulfilled", () => {
    const updated: Project = { ...mockProject, name: "Alpha Updated" };
    const state = projectReducer(
      loadedState,
      updateProject.fulfilled(updated, "", { id: "p1", name: "Alpha Updated", description: "", color: "" })
    );
    expect(state.projects[0].name).toBe("Alpha Updated");
  });

  it("does not change the list if project id is not found", () => {
    const unrelatedProject: Project = { ...mockProject, id: "p999", name: "Ghost" };
    const state = projectReducer(
      loadedState,
      updateProject.fulfilled(unrelatedProject, "", { id: "p999", name: "Ghost", description: "", color: "" })
    );

    expect(state.projects).toHaveLength(1);
    expect(state.projects[0].name).toBe("Alpha");
  });
});

describe("projectSlice — deleteProject", () => {
  it("removes the project from the list on fulfilled", () => {
    const state = projectReducer(
      loadedState,
      deleteProject.fulfilled("p1", "", { id: "p1" })
    );
    expect(state.projects).toHaveLength(0);
  });

  it("leaves other projects untouched", () => {
    const secondProject: Project = { ...mockProject, id: "p2", name: "Beta" };
    const twoProjects = { ...loadedState, projects: [mockProject, secondProject] };
    const state = projectReducer(
      twoProjects,
      deleteProject.fulfilled("p1", "", { id: "p1" })
    );
    expect(state.projects).toHaveLength(1);
    expect(state.projects[0].id).toBe("p2");
  });
});

describe("projectSlice — addProjectMember", () => {
  const newMember = {
    id: "pm1",
    userId: "u2",
    projectId: "p1",
    user: { id: "u2", email: "bob@b.com", username: "bob", role: "MEMBER" },
  };

  it("appends a new member to the correct project", () => {
    const state = projectReducer(
      loadedState,
      addProjectMember.fulfilled(newMember, "", { projectId: "p1", email: "bob@b.com" })
    );
    expect(state.projects[0].members).toHaveLength(1);
    expect(state.projects[0].members[0].userId).toBe("u2");
  });

  it("does not add duplicate members", () => {
    const stateWithMember = {
      ...loadedState,
      projects: [{ ...mockProject, members: [newMember] }],
    };
    const state = projectReducer(
      stateWithMember,
      addProjectMember.fulfilled(newMember, "", { projectId: "p1", email: "bob@b.com" })
    );
    expect(state.projects[0].members).toHaveLength(1);
  });
});

describe("projectSlice — removeProjectMember", () => {
  const existingMember = {
    id: "pm1",
    userId: "u2",
    projectId: "p1",
    user: { id: "u2", email: "bob@b.com", username: "bob", role: "MEMBER" },
  };
  const stateWithMember = {
    ...loadedState,
    projects: [{ ...mockProject, members: [existingMember] }],
  };

  it("removes the member from the correct project", () => {
    const state = projectReducer(
      stateWithMember,
      removeProjectMember.fulfilled({ projectId: "p1", userId: "u2" }, "", { projectId: "p1", userId: "u2" })
    );
    expect(state.projects[0].members).toHaveLength(0);
  });

  it("does not affect other projects", () => {
    const secondProject: Project = { ...mockProject, id: "p2", members: [existingMember] };
    const twoProjects = {
      ...loadedState,
      projects: [mockProject, secondProject],
    };
    const state = projectReducer(
      twoProjects,
      removeProjectMember.fulfilled({ projectId: "p2", userId: "u2" }, "", { projectId: "p2", userId: "u2" })
    );
    expect(state.projects[0].members).toHaveLength(0);
    expect(state.projects[1].members).toHaveLength(0);
  });
});