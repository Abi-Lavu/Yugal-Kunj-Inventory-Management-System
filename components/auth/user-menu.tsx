"use client";

import { authClient } from "@/lib/auth-client";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || user?.email?.[0]?.toUpperCase();

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
          {isPending ? (
            <User className="w-5 h-5" />
          ) : (
            <span className="text-sm font-semibold">{initials || "U"}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            {user?.name || "Account"}
          </div>
          <div className="text-xs text-gray-400 truncate">
            {user?.email || "Signed in"}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        className="p-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}
