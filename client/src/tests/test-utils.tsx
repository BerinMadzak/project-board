import type { ReactElement } from "react";
import type { RootState } from "../store/store";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/slices/authSlice";
import projectReducer from "../store/slices/projectSlice";
import taskReducer from "../store/slices/taskSlice";
import analyticsReducer from "../store/slices/analyticsSlice";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";

export function renderWithProviders(
    ui: ReactElement,
    {
        preloadedState = {},
        initialEntries = ["/"],
    }: {
        preloadedState?: Partial<RootState>;
        initialEntries?: string[];
    } = {}
) {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            projects: projectReducer,
            tasks: taskReducer,
            analytics: analyticsReducer
        },
        preloadedState: preloadedState as RootState
    });

    return {
        ...render(
            <Provider store={store}>
                <MemoryRouter initialEntries={initialEntries}>
                    {ui}
                </MemoryRouter>
            </Provider>
        ),
        store
    };
}