import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTokenStatus, consumeTokens } from "@/lib/tokens";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const DOC_PROMPTS: Record<string, (data: any) => string> = {
  invoice: (d) => `
Generate a professional invoice document in clean Markdown format for:

**Agency:** Clarix Studio
**Client:** ${d.client.company} (${d.client.name})
**Client Email:** ${d.client.email}
**Project:** ${d.name}
**Amount:** ${d.documents.invoiceAmount || "TBD"}
**Invoice Date:** ${d.documents.invoiceDate || new Date().toLocaleDateString()}
**Due Date:** ${d.deadline || "30 days from invoice date"}
**Description:** ${d.description}
**Tech Stack:** ${d.techStack.join(", ")}

Include: Invoice number (auto-generated), itemized services breakdown based on the tech stack and project description, payment terms (50% upfront 50% on delivery), bank/UPI payment details section (leave as [FILL IN]), GST/tax section, late payment clause, and a professional sign-off. Keep it formal, clean, and ready to send.`,

  acknowledgement: (d) => `
Generate a professional Project Acknowledgement Letter in clean Markdown format:

**From:** Clarix Studio  
**To:** ${d.client.name}, ${d.client.company}
**Project:** ${d.name}
**Date:** ${new Date().toLocaleDateString()}

The letter should acknowledge receipt of the project brief, confirm understanding of requirements, outline the agreed scope (based on: ${d.description}), mention the tech stack (${d.techStack.join(", ")}), confirm timeline (start: ${d.startDate || "TBD"}, deadline: ${d.deadline || "TBD"}), and express enthusiasm about the collaboration. Formal but warm tone. Include signature block.`,

  welcomeDoc: (d) => `
Generate a comprehensive Welcome Document / Client Onboarding Guide in clean Markdown format:

**Agency:** Clarix Studio  
**Client:** ${d.client.company}
**Project:** ${d.name}
**Project Manager Contact:** [FILL IN]

Include these sections:
1. Welcome message
2. Team introduction (mention ${d.team.map((t: any) => `${t.name} (${t.role})`).join(", ") || "the dedicated team"})
3. Project overview and goals: ${d.description}
4. Communication channels and response times
5. Project timeline with milestones: ${d.milestones.map((m: any) => m.title).join(", ") || "to be confirmed"}
6. How to request changes/feedback
7. Tools we'll use: ${d.techStack.join(", ")}
8. Payment schedule: ${d.documents.invoiceAmount || "as agreed"}
9. Important contacts and escalation path
10. Next steps for client

Warm, professional, reassuring tone.`,

  contract: (d) => `
Generate a professional Freelance/Agency Service Agreement in clean Markdown format:

**Service Provider:** Clarix Studio ("Agency")
**Client:** ${d.client.company}, represented by ${d.client.name} ("Client")
**Project:** ${d.name}
**Project Value:** ${d.budget || d.documents.invoiceAmount || "As mutually agreed"}
**Start Date:** ${d.startDate || "Upon signing"}
**Delivery Date:** ${d.deadline || "As per project timeline"}

Include these clauses:
1. Scope of Work (based on: ${d.description})
2. Deliverables and tech stack: ${d.techStack.join(", ")}
3. Payment Terms (50% advance, 50% on delivery)
4. Revision Policy (2 rounds of revisions included)
5. Intellectual Property (transfers on full payment)
6. Confidentiality
7. Termination Clause (14 days notice)
8. Limitation of Liability
9. Governing Law (India / [STATE])
10. Dispute Resolution
11. Force Majeure
12. Entire Agreement

Signature blocks for both parties with date. Professional legal-style language. Note: "This is a template, consult a lawyer for binding contracts."`,

  nda: (d) => `
Generate a professional Non-Disclosure Agreement (NDA) in clean Markdown format:

**Disclosing Party:** ${d.client.company} ("Client")
**Receiving Party:** Clarix Studio ("Agency")  
**Effective Date:** ${new Date().toLocaleDateString()}
**Project Context:** ${d.name} — ${d.description}

Include:
1. Definition of Confidential Information
2. Obligations of Receiving Party
3. Exclusions from Confidential Information
4. Term (2 years from effective date)
5. Return of Materials
6. Remedies (injunctive relief)
7. General Provisions
8. Governing Law

Signature blocks for both parties. Professional legal language with note that this is a template.`,
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { docType, projectData } = await req.json();
    if (!docType || !projectData) {
      return NextResponse.json({ error: "Missing docType or projectData" }, { status: 400 });
    }

    // Check token limits
    const status = await getTokenStatus(user.id);
    if (!status.canGenerate) {
      return NextResponse.json({
        error: "Daily limit reached",
        tokensRemaining: 0,
        requestsRemaining: status.requestsRemaining,
        resetTime: status.resetTime,
        upgradeUrl: "https://buymeacoffee.com/chitransh01",
      }, { status: 429 });
    }

    if (status.requestsRemaining <= 0) {
      return NextResponse.json({
        error: "Daily request limit reached",
        upgradeUrl: "https://buymeacoffee.com/chitransh01",
        resetTime: status.resetTime,
      }, { status: 429 });
    }

    const promptFn = DOC_PROMPTS[docType];
    if (!promptFn) return NextResponse.json({ error: "Invalid document type" }, { status: 400 });

    const prompt = promptFn(projectData);

    // Call Gemini
    const geminiRes = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.json();
      return NextResponse.json({ error: "Gemini API error", details: err }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const tokensUsed = geminiData.usageMetadata?.totalTokenCount || Math.ceil(text.length / 4);

    // Deduct tokens
    await consumeTokens(user.id, tokensUsed);

    return NextResponse.json({
      content: text,
      tokensUsed,
      tokensRemaining: status.tokensRemaining - tokensUsed,
      requestsRemaining: status.requestsRemaining - 1,
    });
  } catch (err: any) {
    console.error("Doc generation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
