import { Docker } from "@/components/icons/docker";
import { Prisma } from "@/components/icons/prisma";
import { TypeScript } from "@/components/icons/typescript";
import { AuroraBackground } from "@/components/landing/aurora-bg";
import { CopyCommand } from "@/components/landing/copy-command";
import type { ReactNode } from "react";

type CodePart =
  | { token: string; cls: string }
  | { text: string; cls?: string }
  | { br: true };

const BR: CodePart = { br: true };

const cards: { filename: string; icon: ReactNode; lines: CodePart[] }[] = [
  {
    filename: "Dockerfile",
    icon: <Docker className="size-3.5" />,
    lines: [
      { token: "FROM", cls: "text-purple-400" },
      { text: " node:20-slim " },
      { token: "AS", cls: "text-purple-400" },
      { text: " build" },
      BR,
      { token: "WORKDIR", cls: "text-purple-400" },
      { text: " /app" },
      BR,
      { token: "COPY", cls: "text-purple-400" },
      { text: " package*.json ./" },
      BR,
      { token: "RUN", cls: "text-purple-400" },
      { text: " npm ci" },
      BR,
      { token: "COPY", cls: "text-purple-400" },
      { text: " . ." },
      BR,
      { token: "RUN", cls: "text-purple-400" },
      { text: " npm run build" },
    ],
  },
  {
    filename: "schema.prisma",
    icon: <Prisma className="size-3.5" />,
    lines: [
      { token: "model", cls: "text-purple-400" },
      { text: " Example ", cls: "text-green-400" },
      { text: "{" },
      BR,
      { text: "  id    " },
      { text: "Int", cls: "text-cyan-400" },
      { text: "    @id @default(" },
      { text: "autoincrement()", cls: "text-yellow-400" },
      { text: ")" },
      BR,
      { text: "  name  " },
      { text: "String", cls: "text-cyan-400" },
      BR,
      { text: "  email " },
      { text: "String", cls: "text-cyan-400" },
      { text: " @unique" },
      BR,
      { text: "}" },
    ],
  },
  {
    filename: "app.ts",
    icon: <TypeScript className="size-3.5" />,
    lines: [
      { token: "import", cls: "text-purple-400" },
      { text: " express " },
      { token: "from", cls: "text-purple-400" },
      { text: " " },
      { text: "'express'", cls: "text-green-400" },
      BR,
      BR,
      { token: "const", cls: "text-purple-400" },
      { text: " app = " },
      { text: "express", cls: "text-cyan-400" },
      { text: "()" },
      BR,
      { text: "app." },
      { text: "use", cls: "text-yellow-400" },
      { text: "(" },
      { text: "helmet", cls: "text-cyan-400" },
      { text: "())" },
      BR,
      { text: "app." },
      { text: "use", cls: "text-yellow-400" },
      { text: "(" },
      { text: "cors", cls: "text-cyan-400" },
      { text: "())" },
      BR,
      { text: "app." },
      { text: "use", cls: "text-yellow-400" },
      { text: "(" },
      { text: "pinoHttp", cls: "text-cyan-400" },
      { text: "())" },
    ],
  },
];

function CodeCard({
  filename,
  icon,
  lines,
  className,
}: {
  filename: string;
  icon: ReactNode;
  lines: CodePart[];
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/8 bg-[#0a0a0a]/90 w-[30rem] backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-white/6 px-3 py-2">
        <span className="text-white/40">{icon}</span>
        <span className="text-xs text-white/40">{filename}</span>
      </div>
      <div className="px-4 py-3 font-mono text-[11px] leading-relaxed text-white/70">
        {lines.map((part, i) => {
          if ("br" in part) return <br key={i} />;
          if ("token" in part)
            return (
              <span key={i} className={part.cls}>
                {part.token}
              </span>
            );
          return (
            <span key={i} className={part.cls}>
              {part.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function Cta() {
  return (
    <section className="relative overflow-hidden">
      <AuroraBackground />
      <div className="relative mx-auto w-full max-w-6xl lg:flex  lg:justify-between lg:items-center lg:gap-12 px-6">
        {/* Left */}
        <div className="py-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Ready to build?
          </h2>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Generate a complete backend with one command. Express 5, TypeScript,
            your database, Docker, testing, and deployment config included.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <CopyCommand command="npx pest-js-app" />
          </div>
        </div>

        {/* Right — scrolling code cards */}
        <div
          className="relative hidden lg:block h-80 overflow-hidden"
          aria-hidden="true"

        >
          <div className="flex flex-col gap-3 animate-scroll-up">
            {[...cards, ...cards].map((card, i) => (
              <CodeCard
                key={`${card.filename}-${i}`}
                filename={card.filename}
                icon={card.icon}
                lines={card.lines}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
