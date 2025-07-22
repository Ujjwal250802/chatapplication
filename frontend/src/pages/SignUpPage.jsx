import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon, LoaderIcon, MailIcon, ShipWheelIcon, UserIcon } from "lucide-react";
import useSignUp from "../hooks/useSignUp";
import { useThemeStore } from "../store/useThemeStore";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { theme } = useThemeStore();
  const { signupMutation, isPending, error } = useSignUp();

  const handleSubmit = (e) => {
    e.preventDefault();
    signupMutation(formData);
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
            <p className="text-base-content opacity-70">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

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
                  placeholder="Enter your password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
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
                <span>{error.response?.data?.message || "Signup failed"}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button className="btn btn-primary w-full" disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* LOGIN LINK */}
          <div className="text-center mt-6">
            <p className="text-base-content opacity-70">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;