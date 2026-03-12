"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [command]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-0 py-0 flex items-center gap-2"
    >
      <span className="text-muted-foreground">$</span>
      <span>{command}</span>
      <span className="relative flex size-4 items-center justify-center">
        <Copy
          className={`absolute size-3.5 text-muted-foreground transition-all duration-200 ${
            copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <Check
          className={`absolute size-3.5 text-green-500 transition-all duration-200 ${
            copied ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
