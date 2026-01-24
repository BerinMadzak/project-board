import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

export default function Dashboard() {
    const dispatch = useDispatch();
  
    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <div>
            <h1 className="text-white">Dashboard</h1>
            <button className="text-white" onClick={() => handleLogout()}>Logout</button>
        </div>
    );
}