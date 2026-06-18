"use client";

import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthMode = "sign-in" | "sign-up";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignIn = mode === "sign-in";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = isSignIn
      ? await authClient.signIn.email({
          email,
          password,
          callbackURL: "/dashboard",
        })
      : await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL: "/dashboard",
        });

    setIsSubmitting(false);

    if (response.error) {
      setError(response.error.message ?? "Authentication failed.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isSignIn ? "Sign In" : "Create Account"}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          {isSignIn
            ? "Access your inventory dashboard."
            : "Start managing your inventory."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={`py-2 text-sm font-medium rounded-md transition-colors ${
            isSignIn
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={`py-2 text-sm font-medium rounded-md transition-colors ${
            !isSignIn
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isSignIn && (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required={!isSignIn}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Enter your name"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignIn ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isSignIn ? (
            <LogIn className="w-5 h-5" />
          ) : (
            <UserPlus className="w-5 h-5" />
          )}
          {isSignIn ? "Sign In" : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
