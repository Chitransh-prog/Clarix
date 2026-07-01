"use client";
import { useState } from "react";
import { DocGenerator } from "@/components/docs/DocGenerator";
import { Zap } from "lucide-react";

import {
  FolderOpen, Plus, X, ChevronDown, ChevronUp,
  Calendar, Users, Code2, FileText, CheckCircle2,
  Circle, Clock, AlertCircle, Search, Filter,
  Mail, Phone, Globe, Building2, DollarSign,
  FileCheck, FileX, Send, Download, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── TYPES ───────────────────────────────────────────────
type DocStatus = "sent" | "signed" | "pending" | "not_sent";
type ProjectStatus = "active" | "paused" | "completed" | "cancelled" | "at_risk";
type Priority = "low" | "medium" | "high" | "urgent";

type Client = {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
};

type Documents = {
  invoice: DocStatus;
  invoiceAmount: string;
  invoiceDate: string;
  acknowledgement: DocStatus;
  welcomeDoc: DocStatus;
  contract: DocStatus;
  contractDate: string;
  nda: DocStatus;
};

type Milestone = {
  id: string;
  title: string;
  date: string;
  done: boolean;
};

type TeamMember = {
  name: string;
  role: string;
  email: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  client: Client;
  documents: Documents;
  techStack: string[];
  team: TeamMember[];
  milestones: Milestone[];
  startDate: string;
  deadline: string;
  issueDate: string;
  budget: string;
  tags: string[];
  notes: string;
  createdAt: string;
};

// ─── CONSTANTS ───────────────────────────────────────────
const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: any }> = {
  active:    { label: "Active",    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  paused:    { label: "Paused",    color: "bg-amber-500/15 text-amber-400 border-amber-500/20",      icon: Clock },
  completed: { label: "Completed", color: "bg-blue-500/15 text-blue-400 border-blue-500/20",         icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-500/15 text-red-400 border-red-500/20",            icon: X },
  at_risk:   { label: "At Risk",   color: "bg-orange-500/15 text-orange-400 border-orange-500/20",   icon: AlertCircle },
};

const PRIORITY_CONFIG: Record<Priority, { color: string }> = {
  low:    { color: "bg-obsidian-700 text-obsidian-400" },
  medium: { color: "bg-indigo-500/20 text-indigo-400" },
  high:   { color: "bg-amber-500/20 text-amber-400" },
  urgent: { color: "bg-red-500/20 text-red-400" },
};

const DOC_CONFIG: Record<DocStatus, { label: string; color: string; icon: any }> = {
  signed:   { label: "Signed",   color: "text-emerald-400", icon: FileCheck },
  sent:     { label: "Sent",     color: "text-blue-400",    icon: Send },
  pending:  { label: "Pending",  color: "text-amber-400",   icon: Clock },
  not_sent: { label: "Not sent", color: "text-obsidian-600",icon: FileX },
};

const TECH_OPTIONS = [
  "React","Next.js","Vue","Angular","Svelte",
  "Node.js","Express","NestJS","Django","FastAPI","Laravel",
  "PostgreSQL","MySQL","MongoDB","Supabase","Firebase",
  "Tailwind","TypeScript","JavaScript","Python","PHP",
  "AWS","Vercel","Netlify","Docker","Figma","WordPress","Shopify",
];

const EMPTY_PROJECT: Omit<Project, "id" | "createdAt"> = {
  name: "", description: "", status: "active", priority: "medium",
  client: { name: "", email: "", phone: "", company: "", website: "" },
  documents: {
    invoice: "not_sent", invoiceAmount: "", invoiceDate: "",
    acknowledgement: "not_sent", welcomeDoc: "not_sent",
    contract: "not_sent", contractDate: "", nda: "not_sent",
  },
  techStack: [], team: [], milestones: [],
  startDate: "", deadline: "", issueDate: "", budget: "",
  tags: [], notes: "",
};

// ─── HELPERS ─────────────────────────────────────────────
function daysUntil(date: string) {
  if (!date) return null;
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  return diff;
}

function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── SUB-COMPONENTS ──────────────────────────────────────
function DocBadge({ status, label }: { status: DocStatus; label: string }) {
  const cfg = DOC_CONFIG[status];
  return (
    <div className="flex items-center gap-1.5">
      <cfg.icon size={13} className={cfg.color} />
      <div>
        <p className="text-[10px] text-obsidian-600">{label}</p>
        <p className={cn("text-[11px] font-medium", cfg.color)}>{cfg.label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border", cfg.color)}>
      <cfg.icon size={10} />
      {cfg.label}
    </span>
  );
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const days = daysUntil(deadline);
  if (days === null) return <span className="text-xs text-obsidian-600">No deadline</span>;
  if (days < 0) return <span className="text-xs text-red-400 font-medium">Overdue by {Math.abs(days)}d</span>;
  if (days === 0) return <span className="text-xs text-red-400 font-medium">Due today!</span>;
  if (days <= 3) return <span className="text-xs text-orange-400 font-medium">{days}d left ⚠</span>;
  if (days <= 7) return <span className="text-xs text-amber-400 font-medium">{days}d left</span>;
  return <span className="text-xs text-obsidian-400">{days}d left</span>;
}

// ─── PROJECT CARD ─────────────────────────────────────────
function ProjectCard({
  project,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, s: ProjectStatus) => void;
  
}) {
  const [expanded, setExpanded] = useState(false);
  const [showDocGen, setShowDocGen] = useState(false);
  const docsDone = Object.entries(project.documents)
    .filter(([k]) => ["invoice","acknowledgement","welcomeDoc","contract"].includes(k))
    .filter(([, v]) => v === "signed" || v === "sent").length;

  return (
    <div className={cn(
      "rounded-2xl border bg-obsidian-900/60 transition-all duration-200",
      project.status === "at_risk" ? "border-orange-500/30" :
      project.status === "cancelled" ? "border-obsidian-700/40 opacity-60" : "border-obsidian-800"
    )}>
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-base font-medium text-obsidian-50 truncate">{project.name}</h3>
              <StatusBadge status={project.status} />
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium uppercase", PRIORITY_CONFIG[project.priority].color)}>
                {project.priority}
              </span>
            </div>
            <p className="text-xs text-obsidian-500 truncate">{project.client.company} — {project.client.name}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setShowDocGen(true)} 
              className="p-1.5 rounded-lg text-obsidian-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
              title="Generate document with AI">
              <Zap size={14} />
            </button>
            <button onClick={() => onEdit(project)} className="p-1.5 rounded-lg text-obsidian-500 hover:text-obsidian-100 hover:bg-obsidian-800 transition-colors">
              <FileText size={14} />
            </button>
            <button onClick={() => onDelete(project.id)} className="p-1.5 rounded-lg text-obsidian-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {project.description && (
          <p className="text-xs text-obsidian-400 leading-relaxed mb-3 line-clamp-2">{project.description}</p>
        )}

        {/* Key metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-obsidian-600 shrink-0" />
            <div>
              <p className="text-[9px] text-obsidian-600 uppercase tracking-wider">Deadline</p>
              <DeadlineBadge deadline={project.deadline} />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign size={12} className="text-obsidian-600 shrink-0" />
            <div>
              <p className="text-[9px] text-obsidian-600 uppercase tracking-wider">Budget</p>
              <p className="text-xs text-obsidian-300 font-medium">{project.budget || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-obsidian-600 shrink-0" />
            <div>
              <p className="text-[9px] text-obsidian-600 uppercase tracking-wider">Team</p>
              <p className="text-xs text-obsidian-300 font-medium">{project.team.length} member{project.team.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText size={12} className="text-obsidian-600 shrink-0" />
            <div>
              <p className="text-[9px] text-obsidian-600 uppercase tracking-wider">Docs</p>
              <p className="text-xs text-obsidian-300 font-medium">{docsDone}/4 done</p>
            </div>
          </div>
        </div>

        {/* Tech stack */}
        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.techStack.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Status changer */}
        <div className="flex items-center gap-2">
          <select
            value={project.status}
            onChange={e => onStatusChange(project.id, e.target.value as ProjectStatus)}
            className="text-[11px] bg-obsidian-800 border border-obsidian-700 rounded-lg px-2 py-1 text-obsidian-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          >
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>{cfg.label}</option>
            ))}
          </select>
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto flex items-center gap-1 text-[11px] text-obsidian-500 hover:text-obsidian-300 transition-colors"
          >
            {expanded ? <><ChevronUp size={13} /> Less</> : <><ChevronDown size={13} /> More details</>}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-obsidian-800 p-5 flex flex-col gap-5">
          {/* Client info */}
          <div>
            <p className="text-[10px] font-medium text-obsidian-500 uppercase tracking-widest mb-3">Client Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { icon: Building2, label: "Company", value: project.client.company },
                { icon: Users, label: "Contact", value: project.client.name },
                { icon: Mail, label: "Email", value: project.client.email },
                { icon: Phone, label: "Phone", value: project.client.phone },
                { icon: Globe, label: "Website", value: project.client.website },
                { icon: DollarSign, label: "Budget", value: project.budget },
              ].map(({ icon: Icon, label, value }) => value ? (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={12} className="text-obsidian-600 shrink-0" />
                  <span className="text-[10px] text-obsidian-600 shrink-0">{label}:</span>
                  <span className="text-xs text-obsidian-300 truncate">{value}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Documents */}
          <div>
            <p className="text-[10px] font-medium text-obsidian-500 uppercase tracking-widest mb-3">Documents</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <DocBadge status={project.documents.invoice} label="Invoice" />
              <DocBadge status={project.documents.acknowledgement} label="Acknowledgement" />
              <DocBadge status={project.documents.welcomeDoc} label="Welcome Doc" />
              <DocBadge status={project.documents.contract} label="Contract" />
              <DocBadge status={project.documents.nda} label="NDA" />
            </div>
            {project.documents.invoiceAmount && (
              <p className="text-xs text-obsidian-500 mt-2">
                Invoice amount: <span className="text-obsidian-200 font-medium">{project.documents.invoiceAmount}</span>
                {project.documents.invoiceDate && <> · Due: <span className="text-obsidian-200">{formatDate(project.documents.invoiceDate)}</span></>}
              </p>
            )}
            {project.documents.contractDate && (
              <p className="text-xs text-obsidian-500 mt-1">
                Contract date: <span className="text-obsidian-200">{formatDate(project.documents.contractDate)}</span>
              </p>
            )}
          </div>

          {/* Timeline */}
          <div>
            <p className="text-[10px] font-medium text-obsidian-500 uppercase tracking-widest mb-3">Timeline</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-obsidian-800/60 p-3">
                <p className="text-[9px] text-obsidian-600 uppercase tracking-wider mb-1">Start date</p>
                <p className="text-xs text-obsidian-200">{formatDate(project.startDate)}</p>
              </div>
              <div className="rounded-xl bg-obsidian-800/60 p-3">
                <p className="text-[9px] text-obsidian-600 uppercase tracking-wider mb-1">Issue date</p>
                <p className="text-xs text-obsidian-200">{formatDate(project.issueDate)}</p>
              </div>
              <div className={cn("rounded-xl p-3", daysUntil(project.deadline) !== null && daysUntil(project.deadline)! <= 3 ? "bg-red-500/10 border border-red-500/20" : "bg-obsidian-800/60")}>
                <p className="text-[9px] text-obsidian-600 uppercase tracking-wider mb-1">Deadline</p>
                <p className="text-xs text-obsidian-200">{formatDate(project.deadline)}</p>
              </div>
            </div>
          </div>

          {/* Milestones */}
          {project.milestones.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-obsidian-500 uppercase tracking-widest mb-3">Milestones</p>
              <div className="flex flex-col gap-2">
                {project.milestones.map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    {m.done
                      ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      : <Circle size={14} className="text-obsidian-600 shrink-0" />
                    }
                    <span className={cn("text-xs flex-1", m.done ? "text-obsidian-500 line-through" : "text-obsidian-200")}>
                      {m.title}
                    </span>
                    <span className="text-[10px] text-obsidian-600">{formatDate(m.date)}</span>
                    <DeadlineBadge deadline={m.date} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team */}
          {project.team.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-obsidian-500 uppercase tracking-widest mb-3">Team</p>
              <div className="flex flex-wrap gap-2">
                {project.team.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-obsidian-800/60 border border-obsidian-700">
                    <div className="w-6 h-6 rounded-full bg-indigo-600/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-obsidian-200">{m.name}</p>
                      <p className="text-[10px] text-obsidian-500">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {project.notes && (
            <div>
              <p className="text-[10px] font-medium text-obsidian-500 uppercase tracking-widest mb-2">Notes</p>
              <p className="text-xs text-obsidian-400 leading-relaxed bg-obsidian-800/40 rounded-xl p-3">{project.notes}</p>
            </div>
          )}

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-obsidian-800 text-obsidian-400 border border-obsidian-700">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PROJECT FORM MODAL ───────────────────────────────────
function ProjectFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Project | null;
  onSave: (p: Project) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Project, "id" | "createdAt">>(
    initial ? { ...initial } : { ...EMPTY_PROJECT }
  );
  const [tab, setTab] = useState<"basic" | "client" | "docs" | "team" | "milestones" | "tech">("basic");
  const [techInput, setTechInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [memberForm, setMemberForm] = useState({ name: "", role: "", email: "" });
  const [milestoneForm, setMilestoneForm] = useState({ title: "", date: "" });

  function save() {
    if (!form.name.trim()) return;
    onSave({
      ...form,
      id: initial?.id || crypto.randomUUID(),
      createdAt: initial?.createdAt || new Date().toISOString(),
    });
  }

  function addTech(t: string) {
    if (t && !form.techStack.includes(t)) {
      setForm({ ...form, techStack: [...form.techStack, t] });
    }
    setTechInput("");
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
    setTagInput("");
  }

  function addMember() {
    if (!memberForm.name.trim()) return;
    setForm({ ...form, team: [...form.team, { ...memberForm }] });
    setMemberForm({ name: "", role: "", email: "" });
  }

  function addMilestone() {
    if (!milestoneForm.title.trim()) return;
    setForm({ ...form, milestones: [...form.milestones, { id: crypto.randomUUID(), ...milestoneForm, done: false }] });
    setMilestoneForm({ title: "", date: "" });
  }

  function toggleMilestone(id: string) {
    setForm({ ...form, milestones: form.milestones.map(m => m.id === id ? { ...m, done: !m.done } : m) });
  }

  const tabs = ["basic","client","docs","team","tech","milestones"] as const;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-obsidian-900 border border-obsidian-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90dvh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-obsidian-800 shrink-0">
          <h2 className="text-base font-medium text-obsidian-50">
            {initial ? "Edit project" : "New client project"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl text-obsidian-500 hover:text-obsidian-200 hover:bg-obsidian-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-obsidian-800 overflow-x-auto shrink-0 scrollbar-none">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2.5 text-xs font-medium whitespace-nowrap capitalize transition-colors shrink-0",
                tab === t ? "text-indigo-400 border-b-2 border-indigo-500" : "text-obsidian-500 hover:text-obsidian-300"
              )}>
              {t === "docs" ? "Documents" : t === "tech" ? "Tech Stack" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── BASIC ── */}
          {tab === "basic" && (
            <div className="flex flex-col gap-4">
              <Field label="Project name *">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. E-commerce Website for Acme Corp"
                  className={inputCls} />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What does this project involve?" rows={3}
                  className={cn(inputCls, "resize-none")} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Status">
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ProjectStatus })} className={inputCls}>
                    {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })} className={inputCls}>
                    {(["low","medium","high","urgent"] as Priority[]).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Budget">
                  <input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                    placeholder="e.g. ₹50,000 or $2,000" className={inputCls} />
                </Field>
                <Field label="Start date">
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Deadline">
                  <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Issue / Delivery date">
                  <input type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="Notes">
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes, requirements, or context..." rows={3}
                  className={cn(inputCls, "resize-none")} />
              </Field>
              <Field label="Tags (press Enter to add)">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-obsidian-800 text-obsidian-300 border border-obsidian-700">
                      #{t}
                      <button onClick={() => setForm({ ...form, tags: form.tags.filter(x => x !== t) })}><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}}
                  placeholder="design, web, mobile..." className={inputCls} />
              </Field>
            </div>
          )}

          {/* ── CLIENT ── */}
          {tab === "client" && (
            <div className="flex flex-col gap-4">
              <Field label="Client / Contact name">
                <input value={form.client.name} onChange={e => setForm({ ...form, client: { ...form.client, name: e.target.value } })}
                  placeholder="John Smith" className={inputCls} />
              </Field>
              <Field label="Company name">
                <input value={form.client.company} onChange={e => setForm({ ...form, client: { ...form.client, company: e.target.value } })}
                  placeholder="Acme Corporation" className={inputCls} />
              </Field>
              <Field label="Email">
                <input type="email" value={form.client.email} onChange={e => setForm({ ...form, client: { ...form.client, email: e.target.value } })}
                  placeholder="john@acme.com" className={inputCls} />
              </Field>
              <Field label="Phone">
                <input value={form.client.phone} onChange={e => setForm({ ...form, client: { ...form.client, phone: e.target.value } })}
                  placeholder="+91 98765 43210" className={inputCls} />
              </Field>
              <Field label="Website">
                <input value={form.client.website} onChange={e => setForm({ ...form, client: { ...form.client, website: e.target.value } })}
                  placeholder="https://acme.com" className={inputCls} />
              </Field>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {tab === "docs" && (
            <div className="flex flex-col gap-5">
              {/* Invoice */}
              <div className="rounded-xl bg-obsidian-800/40 border border-obsidian-800 p-4 flex flex-col gap-3">
                <p className="text-xs font-medium text-obsidian-300 flex items-center gap-1.5"><DollarSign size={13} /> Invoice</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Status">
                    <select value={form.documents.invoice} onChange={e => setForm({ ...form, documents: { ...form.documents, invoice: e.target.value as DocStatus } })} className={inputCls}>
                      {Object.entries(DOC_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Amount">
                    <input value={form.documents.invoiceAmount} onChange={e => setForm({ ...form, documents: { ...form.documents, invoiceAmount: e.target.value } })}
                      placeholder="₹50,000" className={inputCls} />
                  </Field>
                </div>
                <Field label="Invoice date">
                  <input type="date" value={form.documents.invoiceDate} onChange={e => setForm({ ...form, documents: { ...form.documents, invoiceDate: e.target.value } })} className={inputCls} />
                </Field>
              </div>

              {/* Other docs */}
              {[
                { key: "acknowledgement", label: "Acknowledgement Letter", icon: FileText },
                { key: "welcomeDoc", label: "Welcome Document", icon: Download },
                { key: "contract", label: "Contract Agreement", icon: FileCheck },
                { key: "nda", label: "NDA", icon: Eye },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="rounded-xl bg-obsidian-800/40 border border-obsidian-800 p-4">
                  <p className="text-xs font-medium text-obsidian-300 flex items-center gap-1.5 mb-3">
                    <Icon size={13} /> {label}
                  </p>
                  <select
                    value={(form.documents as any)[key]}
                    onChange={e => setForm({ ...form, documents: { ...form.documents, [key]: e.target.value as DocStatus } })}
                    className={inputCls}
                  >
                    {Object.entries(DOC_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                  {key === "contract" && (
                    <div className="mt-3">
                      <Field label="Contract date">
                        <input type="date" value={form.documents.contractDate}
                          onChange={e => setForm({ ...form, documents: { ...form.documents, contractDate: e.target.value } })}
                          className={inputCls} />
                      </Field>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── TEAM ── */}
          {tab === "team" && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-obsidian-800/40 border border-obsidian-800 p-4 flex flex-col gap-3">
                <p className="text-xs font-medium text-obsidian-300">Add team member</p>
                <Field label="Name">
                  <input value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                    placeholder="Chitransh Prasad" className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Role">
                    <input value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}
                      placeholder="Frontend Dev" className={inputCls} />
                  </Field>
                  <Field label="Email">
                    <input value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })}
                      placeholder="dev@team.com" className={inputCls} />
                  </Field>
                </div>
                <button onClick={addMember}
                  className="w-full py-2 rounded-xl text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-colors font-medium">
                  Add member
                </button>
              </div>
              {form.team.length > 0 && (
                <div className="flex flex-col gap-2">
                  {form.team.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-obsidian-800/60 border border-obsidian-700">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-[11px] font-bold text-indigo-400 shrink-0">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-obsidian-200 font-medium">{m.name}</p>
                        <p className="text-xs text-obsidian-500">{m.role} {m.email && `· ${m.email}`}</p>
                      </div>
                      <button onClick={() => setForm({ ...form, team: form.team.filter((_, j) => j !== i) })}
                        className="text-obsidian-600 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TECH STACK ── */}
          {tab === "tech" && (
            <div className="flex flex-col gap-4">
              <Field label="Search or type a technology">
                <input value={techInput} onChange={e => setTechInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTech(techInput); }}}
                  placeholder="Type tech name and press Enter" className={inputCls} />
              </Field>
              <div>
                <p className="text-xs text-obsidian-500 mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {TECH_OPTIONS.filter(t => !form.techStack.includes(t))
                    .filter(t => techInput === "" || t.toLowerCase().includes(techInput.toLowerCase()))
                    .map(t => (
                      <button key={t} onClick={() => addTech(t)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-obsidian-800 hover:bg-indigo-600/20 text-obsidian-400 hover:text-indigo-400 border border-obsidian-700 hover:border-indigo-500/30 transition-colors">
                        {t}
                      </button>
                    ))}
                </div>
              </div>
              {form.techStack.length > 0 && (
                <div>
                  <p className="text-xs text-obsidian-500 mb-2">Selected ({form.techStack.length}):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.techStack.map(t => (
                      <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-indigo-600/15 text-indigo-400 border border-indigo-500/20">
                        {t}
                        <button onClick={() => setForm({ ...form, techStack: form.techStack.filter(x => x !== t) })}>
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MILESTONES ── */}
          {tab === "milestones" && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-obsidian-800/40 border border-obsidian-800 p-4 flex flex-col gap-3">
                <p className="text-xs font-medium text-obsidian-300">Add milestone</p>
                <Field label="Title">
                  <input value={milestoneForm.title} onChange={e => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                    placeholder="e.g. Design mockups approved" className={inputCls} />
                </Field>
                <Field label="Target date">
                  <input type="date" value={milestoneForm.date} onChange={e => setMilestoneForm({ ...milestoneForm, date: e.target.value })} className={inputCls} />
                </Field>
                <button onClick={addMilestone}
                  className="w-full py-2 rounded-xl text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-colors font-medium">
                  Add milestone
                </button>
              </div>

              {form.milestones.length > 0 && (
                <div className="flex flex-col gap-2">
                  {form.milestones.map(m => (
                    <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-obsidian-800/60 border border-obsidian-700">
                      <button onClick={() => toggleMilestone(m.id)}>
                        {m.done
                          ? <CheckCircle2 size={16} className="text-emerald-400" />
                          : <Circle size={16} className="text-obsidian-600 hover:text-obsidian-300" />
                        }
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", m.done ? "text-obsidian-500 line-through" : "text-obsidian-200")}>{m.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-obsidian-600">{formatDate(m.date)}</span>
                          <DeadlineBadge deadline={m.date} />
                        </div>
                      </div>
                      <button onClick={() => setForm({ ...form, milestones: form.milestones.filter(x => x.id !== m.id) })}
                        className="text-obsidian-600 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="px-5 py-4 border-t border-obsidian-800 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-obsidian-400 bg-obsidian-800 hover:bg-obsidian-700 transition-colors">
            Cancel
          </button>
          <button onClick={save} disabled={!form.name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium">
            {initial ? "Save changes" : "Create project"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FIELD WRAPPER ────────────────────────────────────────
const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-obsidian-400">{label}</label>
      {children}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");

  function saveProject(p: Project) {
    setProjects(prev => {
      const exists = prev.find(x => x.id === p.id);
      return exists ? prev.map(x => x.id === p.id ? p : x) : [p, ...prev];
    });
    setShowModal(false);
    setEditingProject(null);
  }

  function deleteProject(id: string) {
    if (confirm("Delete this project?")) setProjects(prev => prev.filter(p => p.id !== id));
  }

  function updateStatus(id: string, status: ProjectStatus) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }

  function openEdit(p: Project) { setEditingProject(p); setShowModal(true); }

  const filtered = projects.filter(p => {
    const matchSearch = search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.company.toLowerCase().includes(search.toLowerCase()) ||
      p.client.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchPriority = filterPriority === "all" || p.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  // Stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    atRisk: projects.filter(p => p.status === "at_risk").length,
    docsComplete: projects.filter(p =>
      p.documents.invoice !== "not_sent" &&
      p.documents.contract !== "not_sent" &&
      p.documents.acknowledgement !== "not_sent"
    ).length,
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-medium text-obsidian-50 tracking-tight">Client Projects</h1>
          <p className="text-xs text-obsidian-500 mt-0.5">{projects.length} projects total</p>
        </div>
        <button onClick={() => { setEditingProject(null); setShowModal(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">
          <Plus size={15} /> New project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-obsidian-200" },
          { label: "Active", value: stats.active, color: "text-emerald-400" },
          { label: "At risk", value: stats.atRisk, color: "text-orange-400" },
          { label: "Docs complete", value: stats.docsComplete, color: "text-blue-400" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-obsidian-900/60 border border-obsidian-800 p-4">
            <p className={cn("text-2xl font-medium tracking-tight", s.color)}>{s.value}</p>
            <p className="text-xs text-obsidian-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects or clients..."
            className="w-full pl-8 pr-3.5 py-2 rounded-xl text-sm bg-obsidian-900 border border-obsidian-800 text-obsidian-100 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 rounded-xl text-sm bg-obsidian-900 border border-obsidian-800 text-obsidian-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
          <option value="all">All statuses</option>
          {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as any)}
          className="px-3 py-2 rounded-xl text-sm bg-obsidian-900 border border-obsidian-800 text-obsidian-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
          <option value="all">All priorities</option>
          {(["urgent","high","medium","low"] as Priority[]).map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Project list */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filtered.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={openEdit}
              onDelete={deleteProject}
              onStatusChange={updateStatus}
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl bg-obsidian-900/40 border border-obsidian-800 border-dashed p-16 text-center">
          <FolderOpen size={36} className="text-obsidian-700 mx-auto mb-4" />
          <h2 className="text-base font-medium text-obsidian-300 mb-2">No projects yet</h2>
          <p className="text-sm text-obsidian-600 mb-6 max-w-xs mx-auto">
            Add your first client project with all the details — docs, team, timeline, and tech stack.
          </p>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
            <Plus size={15} /> Create first project
          </button>
        </div>
      ) : (
        <div className="py-12 text-center">
          <Search size={24} className="text-obsidian-700 mx-auto mb-3" />
          <p className="text-sm text-obsidian-500">No projects match your search</p>
          <button onClick={() => { setSearch(""); setFilterStatus("all"); setFilterPriority("all"); }}
            className="text-xs text-indigo-400 mt-2 inline-block hover:text-indigo-300">
            Clear filters
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProjectFormModal
          initial={editingProject}
          onSave={saveProject}
          onClose={() => { setShowModal(false); setEditingProject(null); }}
        />
      )}
    </div>
  );
}

