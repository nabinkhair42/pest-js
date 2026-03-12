import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  size?: "default" | "lg";
}

export function FeatureCard({
  icon,
  title,
  description,
  size = "default",
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        size === "lg" ? "p-7" : "p-5"
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        {/* Icon with background */}
        <div
          className={cn(
            "mb-3 inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20 [&>svg]:size-5 [&>img]:size-5",
            size === "lg" ? "size-12 [&>svg]:size-6 [&>img]:size-6" : "size-10"
          )}
        >
          {icon}
        </div>

        <h3
          className={cn(
            "mb-1.5 font-semibold tracking-tight",
            size === "lg" && "text-lg"
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-sm leading-relaxed text-muted-foreground",
            size === "lg" && "max-w-md"
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
