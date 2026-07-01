"use client";
import { useState } from "react";
import {
  BarChart3, TrendingUp, CheckCircle2,
  Clock, AlertCircle, FileText,
} from "lucide-react";

// Using Recharts (already installed)
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

export default function AnalyticsPage() {
  // Demo data — replace with real Supabase queries in production
  const projectStatusData = [
    { name: "Active",    value: 8,  color: "#10B981" },
    { name: "Paused",   value: 3,  color: "#F59E0B" },
    { name: "Done",     value: 12, color: "#3B82F6" },
    { name: "At Risk",  value: 2,  color: "#F97316" },
    { name: "Cancelled",value: 1,  color: "#EF4444" },
  ];

  const docStatusData = [
    { doc: "Invoice",     sent: 18, signed: 14, pending: 4 },
    { doc: "Contract",    sent: 15, signed: 12, pending: 3 },
    { doc: "Welcome",     sent: 20, signed: 18, pending: 2 },
    { doc: "Ack. Letter", sent: 16, signed: 13, pending: 3 },
    { doc: "NDA",         sent: 10, signed: 8,  pending: 2 },
  ];

  const monthlyData = [
    { month: "Jan", projects: 2, revenue: 45000, tasks: 24 },
    { month: "Feb", projects: 3, revenue: 62000, tasks: 38 },
    { month: "Mar", projects: 4, revenue: 58000, tasks: 45 },
    { month: "Apr", projects: 3, revenue: 75000, tasks: 41 },
    { month: "May", projects: 5, revenue: 92000, tasks: 67 },
    { month: "Jun", projects: 4, revenue: 88000, tasks: 55 },
  ];

  const taskPriorityData = [
    { name: "Urgent", value: 5,  color: "#EF4444" },
    { name: "High",   value: 12, color: "#F59E0B" },
    { name: "Medium", value: 28, color: "#6366F1" },
    { name: "Low",    value: 15, color: "#71717A" },
  ];

  const techStackData = [
    { tech: "Next.js",    count: 12 },
    { tech: "React",      count: 9 },
    { tech: "Tailwind",   count: 14 },
    { tech: "Supabase",   count: 7 },
    { tech: "WordPress",  count: 5 },
    { tech: "Shopify",    count: 4 },
    { tech: "Node.js",    count: 6 },
    { tech: "Figma",      count: 8 },
  ];

  const TOOLTIP_STYLE = {
    backgroundColor: "#18181B",
    border: "1px solid #3F3F46",
    borderRadius: "12px",
    color: "#F4F4F5",
    fontSize: "12px",
  };

  const AXIS_TICK = { fill: "#71717A", fontSize: 11 };
  const GRID_COLOR = "#27272A";

  const stats = [
    { label: "Total projects",   value: "26",    change: "+4 this month",  icon: BarChart3,    color: "text-indigo-400",  bg: "bg-indigo-500/10 border-indigo-500/20" },
    { label: "Completion rate",  value: "73%",   change: "+5% vs last mo", icon: TrendingUp,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Avg turnaround",   value: "18d",   change: "−2 days faster", icon: Clock,        color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Docs completion",  value: "84%",   change: "+11% this month",icon: FileText,     color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "At-risk projects", value: "2",     change: "Needs attention",icon: AlertCircle,  color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Tasks completed",  value: "247",   change: "+38 this month", icon: CheckCircle2, color: "text-teal-400",    bg: "bg-teal-500/10 border-teal-500/20" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-medium text-obsidian-50 tracking-tight">Analytics</h1>
        <p className="text-xs text-obsidian-500 mt-0.5">Project and task performance overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl bg-obsidian-900/60 border border-obsidian-800 p-4">
            <div className={`w-7 h-7 rounded-xl border flex items-center justify-center mb-2 ${s.bg}`}>
              <s.icon size={13} className={s.color} />
            </div>
            <p className="text-xl font-bold text-obsidian-50 tracking-tight">{s.value}</p>
            <p className="text-[10px] text-obsidian-500 mt-0.5 leading-tight">{s.label}</p>
            <p className="text-[10px] text-indigo-400 mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Monthly projects + revenue */}
        <div className="rounded-2xl bg-obsidian-900/60 border border-obsidian-800 p-5">
          <h3 className="text-sm font-medium text-obsidian-100 mb-4">Monthly projects & revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={AXIS_TICK} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#71717A" }} />
              <Line yAxisId="left" type="monotone" dataKey="projects" stroke="#6366F1" strokeWidth={2} dot={{ fill: "#6366F1", r: 3 }} name="Projects" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", r: 3 }} name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Project status pie */}
        <div className="rounded-2xl bg-obsidian-900/60 border border-obsidian-800 p-5">
          <h3 className="text-sm font-medium text-obsidian-100 mb-4">Project status breakdown</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={220}>
              <PieChart>
                <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={3} dataKey="value">
                  {projectStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {projectStatusData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-obsidian-400">{item.name}</span>
                  <span className="text-xs font-medium text-obsidian-200 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document completion bar chart */}
        <div className="rounded-2xl bg-obsidian-900/60 border border-obsidian-800 p-5">
          <h3 className="text-sm font-medium text-obsidian-100 mb-4">Document status by type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={docStatusData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="doc" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#71717A" }} />
              <Bar dataKey="signed"  fill="#10B981" radius={[4,4,0,0]} name="Signed" opacity={0.85} />
              <Bar dataKey="sent"    fill="#6366F1" radius={[4,4,0,0]} name="Sent"   opacity={0.85} />
              <Bar dataKey="pending" fill="#F59E0B" radius={[4,4,0,0]} name="Pending" opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task priority */}
        <div className="rounded-2xl bg-obsidian-900/60 border border-obsidian-800 p-5">
          <h3 className="text-sm font-medium text-obsidian-100 mb-4">Task priority distribution</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={220}>
              <PieChart>
                <Pie data={taskPriorityData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={3} dataKey="value">
                  {taskPriorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {taskPriorityData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-obsidian-400">{item.name}</span>
                  <span className="text-xs font-medium text-obsidian-200 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tech stack usage */}
      <div className="rounded-2xl bg-obsidian-900/60 border border-obsidian-800 p-5 mb-4">
        <h3 className="text-sm font-medium text-obsidian-100 mb-4">Most used tech stack across projects</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={techStackData} layout="vertical" barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
            <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis dataKey="tech" type="category" tick={AXIS_TICK} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="count" fill="#6366F1" radius={[0,4,4,0]} name="Projects" opacity={0.85}>
              {techStackData.map((_, i) => (
                <Cell key={i} fill={`hsl(${239 + i * 12}, 70%, ${55 + i * 2}%)`} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly tasks bar */}
      <div className="rounded-2xl bg-obsidian-900/60 border border-obsidian-800 p-5">
        <h3 className="text-sm font-medium text-obsidian-100 mb-4">Monthly tasks completed</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="tasks" name="Tasks completed" radius={[6,6,0,0]}>
              {monthlyData.map((_, i) => (
                <Cell key={i} fill="#6366F1" opacity={0.6 + i * 0.07} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
