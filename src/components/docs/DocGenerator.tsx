"use client";
import { useState, useEffect } from "react";
import {
  FileText, Loader, Download, Copy, Check,
  Zap, AlertCircle, ExternalLink, ChevronDown,
  X, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DocType = "invoice" | "acknowledgement" | "welcomeDoc" | "contract" | "nda";

const DOC_OPTIONS: { type: DocType; label: string; desc: string; icon: string }[] = [
  { type: "invoice",         label: "Invoice",              desc: "Professional payment invoice with itemized costs", icon: "💰" },
  { type: "acknowledgement", label: "Acknowledgement Letter", desc: "Confirm project receipt and scope understanding",  icon: "✉️" },
  { type: "welcomeDoc",      label: "Welcome Document",      desc: "Client onboarding guide with process overview",    icon: "🎉" },
  { type: "contract",        label: "Contract Agreement",    desc: "Service agreement with all legal clauses",         icon: "📜" },
  { type: "nda",             label: "NDA",                   desc: "Non-disclosure agreement for client confidentiality", icon: "🔒" },
];

interface TokenStatus {
  tokensUsed: number;
  requestsUsed: number;
  tokensLimit: number;
  requestsLimit: number;
  tokensRemaining: number;
  requestsRemaining: number;
  canGenerate: boolean;
  resetTime: string;
}

interface DocGeneratorProps {
  project: any;
  onClose: () => void;
}

export function DocGenerator({ project, onClose }: DocGeneratorProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocType>("invoice");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [showDonate, setShowDonate] = useState(false);
  const [donateForm, setDonateForm] = useState({ amount: "3", bmcOrderId: "" });
  const [donateLoading, setDonateLoading] = useState(false);

  useEffect(() => {
    fetchTokenStatus();
  }, []);

  async function fetchTokenStatus() {
    const res = await fetch("/api/token-status");
    if (res.ok) setTokenStatus(await res.json());
  }

  async function generate() {
    setLoading(true);
    setContent("");
    try {
      const res = await fetch("/api/generate-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType: selectedDoc, projectData: project }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          toast.error("Daily limit reached. Support to get more tokens!");
          setShowDonate(true);
        } else {
          toast.error(data.error || "Generation failed");
        }
        return;
      }

      setContent(data.content);
      toast.success(`Document generated! ${data.tokensRemaining} tokens remaining today.`);
      fetchTokenStatus();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function copyContent() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadMarkdown() {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedDoc}-${project.name.replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  }

  async function submitDonation() {
    if (!donateForm.bmcOrderId.trim()) {
      toast.error("Please enter your Buy Me a Coffee order ID");
      return;
    }
    setDonateLoading(true);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(donateForm.amount),
          currency: "USD",
          bmcOrderId: donateForm.bmcOrderId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Thank you! Tokens will be added after verification (within 24h).");
        setShowDonate(false);
        setDonateForm({ amount: "3", bmcOrderId: "" });
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDonateLoading(false);
    }
  }

  const tokenPct = tokenStatus ? (tokenStatus.tokensUsed / tokenStatus.tokensLimit) * 100 : 0;
  const resetIn = tokenStatus ? Math.ceil((new Date(tokenStatus.resetTime).getTime() - Date.now()) / 3600000) : 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-obsidian-900 border border-obsidian-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[92dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-obsidian-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 flex items-center justify-center">
              <Zap size={15} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-obsidian-50">AI Doc Generator</h2>
              <p className="text-[11px] text-obsidian-500">{project.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-obsidian-500 hover:text-obsidian-200 hover:bg-obsidian-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Token usage bar */}
          {tokenStatus && (
            <div className="px-5 py-3 border-b border-obsidian-800 bg-obsidian-950/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-obsidian-500">
                  Daily tokens: <span className="text-obsidian-300 font-medium">{tokenStatus.tokensUsed.toLocaleString()}</span> / {tokenStatus.tokensLimit.toLocaleString()}
                </span>
                <span className="text-[11px] text-obsidian-600">Resets in {resetIn}h</span>
              </div>
              <div className="h-1.5 rounded-full bg-obsidian-800 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", tokenPct > 80 ? "bg-red-500" : tokenPct > 50 ? "bg-amber-500" : "bg-indigo-500")}
                  style={{ width: `${Math.min(100, tokenPct)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-obsidian-600">
                  {tokenStatus.requestsUsed} / {tokenStatus.requestsLimit} requests used
                </span>
                {tokenPct > 70 && (
                  <button onClick={() => setShowDonate(true)} className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">
                    Get more tokens →
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="p-5 flex flex-col gap-5">
            {/* Doc type selector */}
            <div>
              <p className="text-xs font-medium text-obsidian-400 mb-2.5">Select document type</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DOC_OPTIONS.map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => setSelectedDoc(opt.type)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                      selectedDoc === opt.type
                        ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-400"
                        : "bg-obsidian-800/40 border-obsidian-700 text-obsidian-400 hover:border-obsidian-600"
                    )}
                  >
                    <span className="text-lg shrink-0">{opt.icon}</span>
                    <div>
                      <p className={cn("text-sm font-medium", selectedDoc === opt.type ? "text-indigo-300" : "text-obsidian-200")}>
                        {opt.label}
                      </p>
                      <p className="text-[11px] text-obsidian-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={generate}
              disabled={loading || !tokenStatus?.canGenerate}
              className={cn(
                "w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-medium transition-all",
                tokenStatus?.canGenerate
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-obsidian-800 text-obsidian-500 cursor-not-allowed"
              )}
            >
              {loading ? (
                <><Loader size={16} className="animate-spin" /> Generating with Gemini AI...</>
              ) : !tokenStatus?.canGenerate ? (
                <><AlertCircle size={16} /> Daily limit reached</>
              ) : (
                <><Zap size={16} /> Generate {DOC_OPTIONS.find(d => d.type === selectedDoc)?.label}</>
              )}
            </button>

            {/* Generated content */}
            {content && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-obsidian-400">Generated document</p>
                  <div className="flex items-center gap-2">
                    <button onClick={generate} className="flex items-center gap-1 text-[11px] text-obsidian-500 hover:text-obsidian-300 transition-colors">
                      <RefreshCw size={11} /> Regenerate
                    </button>
                    <button onClick={copyContent}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] bg-obsidian-800 hover:bg-obsidian-700 text-obsidian-300 transition-colors">
                      {copied ? <><Check size={11} className="text-emerald-400" /> Copied!</> : <><Copy size={11} /> Copy</>}
                    </button>
                    <button onClick={downloadMarkdown}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 transition-colors">
                      <Download size={11} /> Download .md
                    </button>
                  </div>
                </div>
                <div className="bg-obsidian-950 border border-obsidian-800 rounded-xl p-4 max-h-80 overflow-y-auto">
                  <pre className="text-xs text-obsidian-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {content}
                  </pre>
                </div>
                <p className="text-[10px] text-obsidian-600 text-center">
                  Copy and paste into Google Docs, Notion, or any editor. Convert to PDF before sending.
                </p>
              </div>
            )}

            {/* Donate / upgrade section */}
            {(showDonate || !tokenStatus?.canGenerate) && (
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">☕</span>
                  <div>
                    <p className="text-sm font-medium text-obsidian-100">Support Clarix & get more tokens</p>
                    <p className="text-xs text-obsidian-400 mt-1 leading-relaxed">
                      Buy me a coffee to unlock additional daily tokens. Every donation directly supports development.
                    </p>
                  </div>
                </div>

                {/* Tier cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    { amount: "1", tokens: "3K", requests: "+600", label: "Starter" },
                    { amount: "3", tokens: "10K", requests: "+2K",  label: "Builder" },
                    { amount: "5", tokens: "20K", requests: "+5K",  label: "Pro" },
                    { amount: "10", tokens: "50K", requests: "+15K", label: "Agency" },
                  ].map(tier => (
                    <button
                      key={tier.amount}
                      onClick={() => setDonateForm({ ...donateForm, amount: tier.amount })}
                      className={cn(
                        "p-3 rounded-xl border text-center transition-all",
                        donateForm.amount === tier.amount
                          ? "bg-amber-500/20 border-amber-500/40"
                          : "bg-obsidian-800/40 border-obsidian-700 hover:border-obsidian-600"
                      )}
                    >
                      <p className="text-xs font-medium text-obsidian-200">{tier.label}</p>
                      <p className="text-lg font-bold text-amber-400">${tier.amount}</p>
                      <p className="text-[10px] text-obsidian-500">{tier.tokens} tokens</p>
                      <p className="text-[10px] text-obsidian-600">{tier.requests} req/day</p>
                    </button>
                  ))}
                </div>

                <a
                  href={`https://buymeacoffee.com/chitransh01`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-obsidian-950 text-sm font-bold transition-colors mb-4"
                >
                  ☕ Buy me a coffee (${donateForm.amount})
                  <ExternalLink size={13} />
                </a>

                <div className="border-t border-obsidian-800 pt-4">
                  <p className="text-xs text-obsidian-400 mb-3">
                    After donating, come back here and enter your Buy Me a Coffee order/support ID to verify:
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={donateForm.bmcOrderId}
                      onChange={e => setDonateForm({ ...donateForm, bmcOrderId: e.target.value })}
                      placeholder="Paste your BMC order ID or support ID"
                      className="flex-1 px-3 py-2 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                    <button
                      onClick={submitDonation}
                      disabled={donateLoading || !donateForm.bmcOrderId.trim()}
                      className="px-4 py-2 rounded-xl text-sm bg-amber-500 hover:bg-amber-600 text-obsidian-950 font-medium disabled:opacity-50 transition-colors shrink-0"
                    >
                      {donateLoading ? <Loader size={14} className="animate-spin" /> : "Verify"}
                    </button>
                  </div>
                  <p className="text-[10px] text-obsidian-600 mt-2">
                    Tokens are added manually within 24 hours after verification.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
