import { useEffect } from "react";
import type { AppDispatch, RootState } from "./store/store";
import { useDispatch, useSelector } from "react-redux";
import { validate } from "./store/slices/authSlice";
import { disconnectSocket, initSocket } from "./services/socket";
import { RouterProvider } from "react-router-dom";
import router from "./routing/router";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      dispatch(validate());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = initSocket(token);

    const onConnect = () => console.log("✅ Socket connected");
    const onError = (err: Error) => console.error("Socket error:", err.message);

    socket.on("connect", onConnect);
    socket.on("connect_error", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
    };
  }, [token]);

  return <RouterProvider router={router} />;
}

export default App;
