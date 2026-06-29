import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="flex h-screen bg-obsidian-950 overflow-hidden">
      <DashboardSidebar user={user} />
      {/* min-h-0 lets flex children shrink below their content size,
          which is required for nested flex-1 children (like Excalidraw)
          to fill height correctly. overflow-hidden instead of
          overflow-y-auto so the whiteboard page manages its own scroll. */}
      <main className="flex-1 h-full min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}