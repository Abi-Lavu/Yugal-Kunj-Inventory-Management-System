import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default async function Home() {
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
        <div className="absolute -left-24 top-10 h-72 w-72 animate-aurora rounded-full bg-violet-400/30 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 animate-float rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-pulse rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h1 className="animate-in fade-in slide-in-from-bottom-4 text-4xl font-bold tracking-tight text-foreground duration-700 sm:text-5xl">
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Yugal Kunj
          </span>
          <span className="mt-1 block text-2xl font-semibold text-foreground sm:text-3xl">
            Inventory Management System
          </span>
        </h1>

        <div
          className="mt-9 flex animate-in fade-in slide-in-from-bottom-4 justify-center duration-700"
          style={{ animationDelay: "120ms" }}
        >
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ size: "lg" }),
              "group h-11 gap-2 px-7 text-sm shadow-lg shadow-violet-600/20"
            )}
          >
            Sign In
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
