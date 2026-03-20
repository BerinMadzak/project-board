import { http, HttpResponse } from "msw";

const baseURL = "http://localhost:3000";

export const handlers = [
    http.post(`${baseURL}/api/auth/login`, () => {
        return HttpResponse.json({
            user: {
                id: "user-1",
                email: "test@example.com",
                username: "testuser",
                role: "MEMBER"
            },
            token: "mock-token"
        });
    }),

    http.post(`${baseURL}/api/auth/register`, () => {
        return HttpResponse.json({
            user: {
                id: "user-1",
                email: "test@example.com",
                username: "testuser",
                role: "MEMBER"
            },
            token: "mock-token",
            message: "User created succesfully"
            },
            { status: 201 } 
        );
    }),

    http.get(`${baseURL}/api/projects`, () => {
        return HttpResponse.json({
            user: {
                id: "p1",
                name: "Test Project",
                description: "A project",
                color: "#6366f1",
                ownerId: "user-1",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                members: []
            },
        });
    }),

    http.get(`${baseURL}/api/tasks/:projectId`, () => {
        return HttpResponse.json([]);
    })
];