import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon, LoaderIcon, MailIcon, ShipWheelIcon } from "lucide-react";
import useLogin from "../hooks/useLogin";
import { useThemeStore } from "../store/useThemeStore";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { theme } = useThemeStore();
  const { loginMutation, isPending, error } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation(formData);
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4" data-theme={theme}>
      <div className="card bg-base-200 w-full max-w-md shadow-xl">
        <div className="card-body p-6 sm:p-8">
          {/* LOGO */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShipWheelIcon className="size-10 text-primary" />
              <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                ChatSphere
              </span>
            </div>
            <p className="text-base-content opacity-70">Welcome back! Please sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* EMAIL */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <div className="relative">
                <MailIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 transform -translate-y-1/2 right-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-5 text-base-content opacity-70" />
                  ) : (
                    <EyeIcon className="size-5 text-base-content opacity-70" />
                  )}
                </button>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="alert alert-error">
                <span>{error.response?.data?.message || "Login failed"}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button className="btn btn-primary w-full" disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* SIGNUP LINK */}
          <div className="text-center mt-6">
            <p className="text-base-content opacity-70">
              Don't have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;