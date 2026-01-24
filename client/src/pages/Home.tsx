import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

export default function Home() {
  const dispatch = useDispatch();
  
  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div>
      <h1 className="text-white">Home</h1>
      <button className="text-white" onClick={() => handleLogout()}>Logout</button>
    </div>
  );
}
