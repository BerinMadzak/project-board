import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../store/store";
import { login } from "../store/slices/authSlice";
import { useEffect } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(state?.path || "/home", { replace: true });
    }
  }, [isAuthenticated, navigate, state]);

  const onSubmit = async (data: LoginFormData) => {
    await dispatch(login(data));
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Project Board Logo"
          src="logo.png"
          className="mx-auto h-50 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-5">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-gray-100"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="email@example.com"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
            {errors.email && (
              <span className="text-red-500">{errors.email.message}</span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-gray-100"
              >
                Password
              </label>
              {/* <div className="text-sm">
                <Link
                  to="/reset-password"
                  className="font-semibold text-indigo-500 hover:text-indigo-400"
                >
                  Forgot password?
                </Link>
              </div> */}
            </div>
            <div className="mt-2">
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                })}
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
            {errors.password && (
              <span className="text-red-500">{errors.password.message}</span>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
