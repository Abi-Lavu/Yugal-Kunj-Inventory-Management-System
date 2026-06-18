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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="max-w-md w-full space-y-8">
        <AuthForm />
        <Link
          href="/"
          className="block text-center text-sm font-medium text-purple-700 hover:text-purple-900"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
