const steps = [
  { step: "01", title: "Create your workspace", description: "Sign up and set up your team workspace in under two minutes. Invite members, set roles, and choose your plan." },
  { step: "02", title: "Add projects and tasks", description: "Organise work into projects. Break each project into tasks, set priorities, assign owners, and add due dates." },
  { step: "03", title: "Track progress in real time", description: "Clarix surfaces blockers before they stall your sprint. Dashboards update live as your team moves work forward." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-5 border-t border-obsidian-800/60">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-xl">
          <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-obsidian-50 leading-[1.1]">Up and running in minutes.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((s) => (
            <div key={s.step} className="flex flex-col gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                <span className="text-lg font-medium text-indigo-400 font-mono">{s.step}</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-obsidian-100 mb-2">{s.title}</h3>
                <p className="text-sm text-obsidian-400 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
