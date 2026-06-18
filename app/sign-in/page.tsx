import AuthForm from "@/components/auth/auth-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-violet-50/40 to-white px-4">
      {/* ambient aurora */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 animate-aurora rounded-full bg-violet-400/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 animate-float rounded-full bg-fuchsia-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-3 text-center duration-500">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Yugal Kunj
            </span>
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Inventory Management System
          </p>
        </div>

        <AuthForm />

        <Link
          href="/"
          className="block text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
