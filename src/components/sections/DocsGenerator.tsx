"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, FileText, Download, Copy, Check,
  ChevronRight, Loader, Lock, ExternalLink,
} from "lucide-react";

const DOC_TYPES = [
  {
    id: "invoice",
    icon: "💰",
    label: "Invoice",
    desc: "Professional payment invoice with itemized costs and payment terms",
    color: "#10B981",
    preview: `# INVOICE

**Invoice No:** INV-2024-001  
**Date:** January 15, 2024  
**Due Date:** January 30, 2024

---

**From:** Clarix Studio  
**To:** Acme Corporation

| Service | Hours | Rate | Amount |
|---------|-------|------|--------|
| UI/UX Design | 20hrs | ₹2,000/hr | ₹40,000 |
| Next.js Development | 40hrs | ₹2,500/hr | ₹1,00,000 |
| Supabase Backend | 15hrs | ₹2,000/hr | ₹30,000 |

**Subtotal:** ₹1,70,000  
**GST (18%):** ₹30,600  
**Total Due: ₹2,00,600**

Payment Terms: 50% advance, 50% on delivery.`
  },
  {
    id: "contract",
    icon: "📜",
    label: "Contract",
    desc: "Complete service agreement with legal clauses and IP rights",
    color: "#6366F1",
    preview: `# SERVICE AGREEMENT

**Between:** Clarix Studio ("Agency")  
**And:** Acme Corporation ("Client")  
**Date:** January 15, 2024

---

## 1. Scope of Work

The Agency agrees to design and develop a full-stack web application including UI/UX design, frontend development using Next.js, and backend integration with Supabase...

## 2. Payment Terms

- 50% advance upon signing
- 50% upon project delivery

## 3. Intellectual Property

All rights transfer to Client upon full payment received.

## 4. Confidentiality

Both parties agree to maintain strict confidentiality...`
  },
  {
    id: "welcomeDoc",
    icon: "🎉",
    label: "Welcome Doc",
    desc: "Client onboarding guide with process, timeline and contacts",
    color: "#F59E0B",
    preview: `# Welcome to Clarix Studio! 🎉

Dear Acme Corporation,

We're thrilled to have you on board! This document outlines everything you need to know about working with us.

---

## Your Dedicated Team

- **Chitransh Prasad** — Project Lead & Developer
- **Design Team** — UI/UX & Branding

## Communication

- **Primary:** Email within 24hrs
- **Urgent:** WhatsApp +91 XXXXX XXXXX
- **Weekly sync:** Every Monday, 11AM IST

## Project Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Design | Week 1-2 | Figma mockups |
| Development | Week 3-6 | Working app |
| Testing | Week 7 | QA + fixes |
| Launch | Week 8 | Live deployment |`
  },
  {
    id: "nda",
    icon: "🔒",
    label: "NDA",
    desc: "Non-disclosure agreement protecting confidential information",
    color: "#EF4444",
    preview: `# NON-DISCLOSURE AGREEMENT

**Effective Date:** January 15, 2024  
**Disclosing Party:** Acme Corporation  
**Receiving Party:** Clarix Studio

---

## 1. Definition of Confidential Information

"Confidential Information" means any data or information, oral or written, disclosed by the Client that is designated as confidential or that reasonably should be understood to be confidential...

## 2. Obligations

The Receiving Party agrees to:
- Hold all Confidential Information in strict confidence
- Not disclose to any third parties
- Use only for the purpose of the project

## 3. Term

This Agreement shall remain in effect for **2 years** from the Effective Date.`
  },
  {
    id: "acknowledgement",
    icon: "✉️",
    label: "Acknowledgement",
    desc: "Project receipt confirmation with scope and timeline clarity",
    color: "#8B5CF6",
    preview: `# PROJECT ACKNOWLEDGEMENT LETTER

**Date:** January 15, 2024  
**To:** John Smith, Acme Corporation  
**Re:** E-commerce Website Development

---

Dear Mr. Smith,

We are pleased to acknowledge the receipt of your project brief for the **E-commerce Website** development.

We have thoroughly reviewed your requirements and are excited to confirm our understanding of the scope:

**Project Scope:**
- Custom e-commerce platform with Next.js
- Payment gateway integration (Razorpay/Stripe)
- Admin dashboard with analytics
- Mobile-responsive design

**Agreed Timeline:** 8 weeks from project kickoff  
**Project Value:** ₹2,00,600

We look forward to a successful collaboration.

Warm regards,  
**Chitransh Prasad**  
Clarix Studio`
  },
];

const SAMPLE_PROJECT = {
  name: "E-commerce Platform",
  client: { name: "John Smith", company: "Acme Corp", email: "john@acme.com" },
  description: "Full-stack e-commerce platform with payment integration",
  techStack: ["Next.js", "Tailwind CSS", "Supabase", "Stripe"],
  budget: "₹2,00,600",
  deadline: "2024-03-15",
  startDate: "2024-01-15",
  team: [{ name: "Chitransh Prasad", role: "Lead Developer" }],
  documents: { invoiceAmount: "₹2,00,600", invoiceDate: "2024-01-15", contractDate: "2024-01-15" },
  milestones: [
    { title: "Design mockups", date: "2024-01-30" },
    { title: "Frontend complete", date: "2024-02-20" },
    { title: "Launch", date: "2024-03-15" },
  ],
  notes: "Client prefers weekly updates via email.",
};

export function DocsGenerator() {
  const [activeDoc, setActiveDoc] = useState(DOC_TYPES[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState(DOC_TYPES[0].preview);
  const [copied, setCopied] = useState(false);

  function selectDoc(doc: typeof DOC_TYPES[0]) {
    setActiveDoc(doc);
    setIsTyping(true);
    setDisplayedText("");

    let i = 0;
    const text = doc.preview;
    const interval = setInterval(() => {
      i += 8;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        setDisplayedText(text);
      }
    }, 12);
  }

  async function copyPreview() {
    await navigator.clipboard.writeText(activeDoc.preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="docs-generator" className="py-28 px-5 border-t border-obsidian-800/60">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-xs text-indigo-400 font-medium mb-4">
              <Zap size={11} />
              Powered by Gemini AI
            </div>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-obsidian-50 leading-[1.1] mb-4">
              Generate client docs
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #818CF8 0%, #4F46E5 50%, #3730A3 100%)",
                }}
              >
                in seconds.
              </span>
            </h2>
            <p className="text-base text-obsidian-400 leading-relaxed mb-6">
              Stop spending hours writing invoices, contracts, and welcome docs from scratch.
              Clarix generates professional, ready-to-send documents tailored to each client project — instantly.
            </p>

            {/* Feature list */}
            <div className="flex flex-col gap-3 mb-8">
              {[
                "Invoice with itemized costs and GST",
                "Contract with IP transfer and payment terms",
                "Welcome doc with timeline and team intro",
                "NDA and Acknowledgement letters",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <Check size={9} className="text-indigo-400" />
                  </div>
                  <span className="text-sm text-obsidian-300">{item}</span>
                </div>
              ))}
            </div>

            {/* Token info */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-obsidian-900/60 border border-obsidian-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Zap size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-obsidian-200">6,000 free tokens daily</p>
                  <p className="text-[11px] text-obsidian-500">Resets every midnight · No card needed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-obsidian-900/60 border border-obsidian-800">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <span className="text-sm">☕</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-obsidian-200">Need more? Support the project</p>
                  <p className="text-[11px] text-obsidian-500">Donate to unlock up to 50K tokens/day</p>
                </div>
                
                  href="https://buymeacoffee.com/chitransh01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[11px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  Donate <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          {/* Live preview panel */}
          <div className="flex flex-col gap-4">
            {/* Doc type selector */}
            <div className="flex flex-wrap gap-2">
              {DOC_TYPES.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => selectDoc(doc)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                    activeDoc.id === doc.id
                      ? "text-white border-transparent"
                      : "bg-obsidian-800/60 border-obsidian-700 text-obsidian-400 hover:text-obsidian-200 hover:border-obsidian-600"
                  }`}
                  style={
                    activeDoc.id === doc.id
                      ? { background: doc.color + "30", borderColor: doc.color + "50", color: doc.color }
                      : {}
                  }
                >
                  <span>{doc.icon}</span>
                  {doc.label}
                </button>
              ))}
            </div>

            {/* Preview window */}
            <div className="rounded-2xl bg-obsidian-900/80 border border-obsidian-800 overflow-hidden shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center justify-between px-4 py-3 bg-obsidian-900 border-b border-obsidian-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-lg">{activeDoc.icon}</span>
                    <span className="text-xs text-obsidian-400 font-medium">{activeDoc.label}</span>
                    {isTyping && (
                      <div className="flex gap-0.5 ml-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 h-1 rounded-full bg-indigo-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: activeDoc.color }}
                  />
                  <span className="text-[10px] text-obsidian-600">AI generating...</span>
                  <button
                    onClick={copyPreview}
                    className="flex items-center gap-1 text-[11px] text-obsidian-500 hover:text-obsidian-200 transition-colors ml-2"
                  >
                    {copied
                      ? <><Check size={11} className="text-emerald-400" /> Copied</>
                      : <><Copy size={11} /> Copy</>
                    }
                  </button>
                </div>
              </div>

              {/* Document content */}
              <div className="p-5 h-72 overflow-y-auto">
                <pre className="text-[11px] text-obsidian-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {displayedText}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-0.5 h-3 bg-indigo-400 ml-0.5 align-middle"
                    />
                  )}
                </pre>
              </div>

              {/* Footer bar */}
              <div className="px-4 py-2.5 border-t border-obsidian-800 flex items-center justify-between bg-obsidian-950/60">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-obsidian-600">
                    ~{Math.ceil(activeDoc.preview.length / 4)} tokens
                  </span>
                  <span className="text-[10px] text-obsidian-700">·</span>
                  <span className="text-[10px] text-obsidian-600">Markdown format</span>
                </div>
                <button className="flex items-center gap-1 text-[11px] text-obsidian-500 hover:text-indigo-400 transition-colors">
                  <Download size={11} />
                  .md
                </button>
              </div>
            </div>

            {/* Doc description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activeDoc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-obsidian-500 text-center"
              >
                {activeDoc.desc}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom CTA strip */}
        <div className="relative rounded-2xl overflow-hidden border border-indigo-500/20 bg-indigo-600/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(79,70,229,0.12) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <p className="text-base font-medium text-obsidian-100 mb-1">
              Ready to generate your first doc?
            </p>
            <p className="text-sm text-obsidian-400">
              Add a client project and hit generate — professional docs in under 10 seconds.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 shrink-0">
            
              href="https://buymeacoffee.com/chitransh01"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-sm font-medium transition-colors"
            >
              ☕ Support
            </a>
            
              href="/auth/signup"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              Get started free
              <ChevronRight size={15} />
            </a>
          </div>
        </div>

        {/* How it works steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          {[
            { step: "01", title: "Add project", desc: "Fill in client details, tech stack, budget and timeline" },
            { step: "02", title: "Pick a doc", desc: "Choose from Invoice, Contract, NDA, Welcome or Acknowledgement" },
            { step: "03", title: "AI generates", desc: "Gemini writes a fully professional, tailored document instantly" },
            { step: "04", title: "Send to client", desc: "Copy, download as Markdown, or paste into Google Docs / Notion" },
          ].map((s) => (
            <div key={s.step} className="flex flex-col gap-3 p-4 rounded-2xl bg-obsidian-900/40 border border-obsidian-800">
              <span className="text-lg font-bold text-obsidian-700 font-mono">{s.step}</span>
              <div>
                <p className="text-sm font-medium text-obsidian-100 mb-1">{s.title}</p>
                <p className="text-xs text-obsidian-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
