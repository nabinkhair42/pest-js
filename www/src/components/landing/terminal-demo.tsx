"use client";

import { Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PROMPT_LINES = [
  { label: "Project name", value: "my-api" },
  { label: "Project description", value: "A PEST.js application" },
  { label: "Author", value: "developer" },
  { label: "Database ORM", value: "Prisma" },
  { label: "Database provider", value: "PostgreSQL" },
  { label: "Add Swagger API docs?", value: "Yes" },
  { label: "Add Docker support?", value: "Yes" },
  { label: "Package manager", value: "pnpm" },
  { label: "Initialize git repository?", value: "Yes" },
  { label: "Install dependencies now?", value: "Yes" },
];

const RESULT_LINES = [
  "Project structure created",
  "Git repository initialized",
  "Dependencies installed",
];

const NEXT_STEPS = [
  "cd my-api",
  "pnpm dev",
  "npx prisma migrate dev --name init",
  "Open http://localhost:3000/api/docs",
];

// Total animated elements: command(1) + banner(1) + prompts(10) + results(3) + next-steps(1) + happy(1) = 17
const TOTAL_STEPS = 17;
const STEP_DELAY = 80; // ms between each line appearing

export function TerminalDemo() {
  const [visibleStep, setVisibleStep] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();

          let step = 0;
          const interval = setInterval(() => {
            step++;
            setVisibleStep(step);
            if (step >= TOTAL_STEPS) clearInterval(interval);
          }, STEP_DELAY);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // Step indices:
  // 0: nothing, 1: command, 2: banner
  // 3–12: prompt lines (10 items)
  // 13–15: result lines (3 items)
  // 16: next steps block
  // 17: happy coding

  const show = (step: number) =>
    visibleStep >= step
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-1";

  const transition = "transition-all duration-300 ease-out";

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a]"
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
        <div className="ml-2 flex gap-1 items-center text-white/40">
          <Terminal /> Terminal
        </div>
      </div>

      {/* Terminal content */}
      <div className="p-5 font-mono text-[13px] leading-relaxed">
        {/* Command */}
        <div className={`${show(1)} ${transition}`}>
          <span className="text-green-400">$</span>{" "}
          <span className="text-white">npx pest-js-app</span>
        </div>

        <div className="mt-3" />

        {/* Banner */}
        <div className={`${show(2)} ${transition} text-yellow-400`}>
          <pre className="text-[10px] leading-tight sm:text-xs">{` ____  _____ ____ _____   _
|  _ \\| ____/ ___|_   _| (_)___
| |_) |  _| \\___ \\ | |   | / __|
|  __/| |___ ___) || | _ | \\__ \\
|_|   |_____|____/ |_|(_)/ |___/
                        |__/`}</pre>
          <div className="mt-1 text-white/40">
            {"  v3.4.0 - Progressive Express Starter Template"}
          </div>
        </div>

        <div className="mt-4" />

        {/* Clack-style prompts */}
        {PROMPT_LINES.map((line, i) => (
          <div key={line.label} className={`${show(3 + i)} ${transition}`}>
            <Line
              symbol="diamond"
              color="cyan"
              label={line.label}
              value={line.value}
            />
            {i < PROMPT_LINES.length - 1 && <Line symbol="bar" />}
          </div>
        ))}

        <div className="mt-3" />

        {/* Spinner results */}
        {RESULT_LINES.map((label, i) => (
          <div key={label} className={`${show(13 + i)} ${transition}`}>
            <Line symbol="check" color="green" label={label} />
            {i < RESULT_LINES.length - 1 && <Line symbol="bar" />}
          </div>
        ))}

        <div className="mt-3" />

        {/* Next steps */}
        <div className={`${show(16)} ${transition}`}>
          <div className="text-white/40">
            {"  "}
            <span className="text-white/60">Next steps</span>
          </div>
          <div className="ml-1 mt-1 border-l-2 border-white/10 pl-3 text-white/50">
            {NEXT_STEPS.map(step => (
              <div key={step}>{step}</div>
            ))}
          </div>
        </div>

        <div className="mt-3" />

        {/* Happy coding */}
        <div className={`${show(17)} ${transition}`}>
          <span className="text-white/40">{"  "}</span>
          <span className="text-cyan-400">{"◇"}</span>{" "}
          <span className="text-white/70">Happy coding!</span>
        </div>
      </div>
    </div>
  );
}

function Line({
  symbol,
  color,
  label,
  value,
}: {
  symbol: "diamond" | "check" | "bar";
  color?: "cyan" | "green";
  label?: string;
  value?: string;
}) {
  if (symbol === "bar") {
    return <div className="text-white/15">{"  │"}</div>;
  }

  const sym = symbol === "diamond" ? "◆" : "✔";
  const symColor =
    color === "cyan"
      ? "text-cyan-400"
      : color === "green"
        ? "text-green-400"
        : "text-white/40";

  return (
    <div>
      <span className="text-white/15">{"  "}</span>
      <span className={symColor}>{sym}</span>{" "}
      <span className="text-white/70">{label}</span>
      {value && (
        <>
          {" "}
          <span className="text-white/40">{"·"}</span>{" "}
          <span className="text-white">{value}</span>
        </>
      )}
    </div>
  );
}
