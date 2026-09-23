import React, { useState } from "react";
import { Link } from "react-router";
function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Login API will be connected here.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#27E6B0]/10 blur-[140px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#27E6B0]/10 blur-[140px]" />

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      {/* Navbar */}
      <header className="relative z-20 border-b border-white/[0.06] bg-black/50 backdrop-blur-xl">

        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">

          {/* Logo */}
          <a href="/" className="flex items-center">

            <img
              src="../src/assets/logo-Photoroom.png"
              alt="ECHO"
              className="h-18 w-auto object-contain"
            />

          </a>

          {/* Signup */}
          <div className="text-sm text-zinc-500">

            Don't have an account?

            <Link
              to="/api/signup"
              className="ml-2 font-semibold text-[#27E6B0] hover:underline"
            >
              Sign up
            </Link>

          </div>

        </div>

      </header>

      {/* Main */}
      <main className="relative z-10 flex min-h-[calc(100vh-76px)] items-center justify-center px-5 py-12">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#090909]/90 shadow-2xl backdrop-blur-xl lg:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="relative hidden overflow-hidden bg-[#080909] p-12 lg:flex lg:flex-col lg:justify-between">

            <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#27E6B0]/10 blur-[100px]" />

            <div className="relative">

              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#27E6B0]/20 bg-[#27E6B0]/5 text-2xl text-[#27E6B0]">
                ♪
              </div>

              <p className="text-xs font-bold tracking-[0.3em] text-[#27E6B0]">
                WELCOME BACK
              </p>

              <h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-tight">

                Your music.

                <br />

                Your mood.

                <br />

                <span className="text-[#27E6B0]">
                  Your ECHO.
                </span>

              </h1>

              <p className="mt-7 max-w-sm leading-7 text-zinc-500">
                Pick up where you left off. Your playlists, favorite
                tracks and discoveries are waiting for you.
              </p>

            </div>

            {/* Equalizer */}
            <div className="relative flex h-28 items-center justify-center gap-1">

              {Array.from({ length: 35 }).map((_, index) => (

                <span
                  key={index}
                  className="w-[3px] rounded-full bg-[#27E6B0]"
                  style={{
                    height: `${20 + ((index * 17) % 75)}px`,
                    opacity: 0.25 + (index % 5) * 0.12,
                    animation: `wave ${
                      0.7 + (index % 5) * 0.12
                    }s ease-in-out infinite alternate`,
                    animationDelay: `${index * 0.03}s`,
                  }}
                />

              ))}

            </div>

            <p className="relative text-xs tracking-[0.3em] text-zinc-700">
              LISTEN • DISCOVER • REPEAT
            </p>

          </div>

          {/* LOGIN FORM */}
          <div className="p-7 sm:p-10 lg:p-12">

            {/* Heading */}
            <div className="mb-8">

              <p className="text-xs font-bold tracking-[0.25em] text-[#27E6B0]">
                SIGN IN
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Sign in to continue listening to your ECHO.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  Email address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#27E6B0]/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#27E6B0]/10"
                />

              </div>

              {/* Password */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-sm font-semibold text-zinc-300">
                    Password
                  </label>

                  <a
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#27E6B0] hover:underline"
                  >
                    Forgot password?
                  </a>

                </div>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 pr-20 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#27E6B0]/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#27E6B0]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-600 transition hover:text-[#27E6B0]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* Remember */}
              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  className="h-4 w-4 accent-[#27E6B0]"
                />

                <span className="text-sm text-zinc-500">
                  Remember me
                </span>

              </label>

              {/* Login */}
              <button
                type="submit"
                className="group flex h-13 w-full items-center justify-center gap-3 rounded-xl bg-[#27E6B0] font-bold text-black transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(39,230,176,0.18)] active:scale-[0.98]"
              >

                Log in to ECHO

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>

              </button>

            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-white/[0.07]" />

              <span className="text-xs text-zinc-700">
                OR
              </span>

              <div className="h-px flex-1 bg-white/[0.07]" />

            </div>

            {/* Google */}
            <button
              type="button"
              className="flex h-13 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >

              <span className="text-lg font-bold">
                G
              </span>

              Continue with Google

            </button>

            {/* Signup */}
            <p className="mt-7 text-center text-sm text-zinc-600">

              Don't have an account?

              <Link
                to="/api/signup"
                className="ml-1 font-semibold text-[#27E6B0] hover:underline"
              >
                Create one
              </Link>

            </p>

          </div>

        </div>

      </main>

      {/* Animation */}
      <style>{`

        @keyframes wave {

          0% {
            transform: scaleY(.35);
          }

          100% {
            transform: scaleY(1);
          }

        }

      `}</style>

    </div>
  );
}

export default Login;