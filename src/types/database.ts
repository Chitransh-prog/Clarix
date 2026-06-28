export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; email: string; full_name: string | null;
          avatar_url: string | null; plan: "free" | "pro" | "team";
          created_at: string; updated_at: string;
        };
        Insert: { id: string; email: string; full_name?: string | null; avatar_url?: string | null; plan?: "free" | "pro" | "team"; };
        Update: { full_name?: string | null; avatar_url?: string | null; plan?: "free" | "pro" | "team"; };
      };
      projects: {
        Row: {
          id: string; workspace_id: string; name: string;
          description: string | null; status: "active" | "archived" | "paused";
          color: string | null; created_by: string; created_at: string; updated_at: string;
        };
        Insert: { workspace_id: string; name: string; description?: string | null; status?: "active" | "archived" | "paused"; color?: string | null; created_by: string; };
        Update: { name?: string; description?: string | null; status?: "active" | "archived" | "paused"; color?: string | null; };
      };
      tasks: {
        Row: {
          id: string; project_id: string; workspace_id: string; title: string;
          description: string | null; status: "todo" | "in_progress" | "review" | "done" | "cancelled";
          priority: "low" | "medium" | "high" | "urgent"; assignee_id: string | null;
          created_by: string; due_date: string | null; position: number;
          created_at: string; updated_at: string;
        };
        Insert: { project_id: string; workspace_id: string; title: string; status?: "todo" | "in_progress" | "review" | "done" | "cancelled"; priority?: "low" | "medium" | "high" | "urgent"; created_by: string; };
        Update: { title?: string; status?: "todo" | "in_progress" | "review" | "done" | "cancelled"; priority?: "low" | "medium" | "high" | "urgent"; due_date?: string | null; position?: number; };
      };
      waitlist: {
        Row: { id: string; email: string; source: string | null; created_at: string; };
        Insert: { email: string; source?: string | null; };
        Update: never;
      };
      workspaces: {
        Row: { id: string; name: string; slug: string; owner_id: string; plan: "free" | "pro" | "team"; created_at: string; updated_at: string; };
        Insert: { name: string; slug: string; owner_id: string; };
        Update: { name?: string; slug?: string; };
      };
      workspace_members: {
        Row: { id: string; workspace_id: string; user_id: string; role: "owner" | "admin" | "member" | "viewer"; joined_at: string; };
        Insert: { workspace_id: string; user_id: string; role?: "owner" | "admin" | "member" | "viewer"; };
        Update: { role?: "owner" | "admin" | "member" | "viewer"; };
      };
    };
  };
}