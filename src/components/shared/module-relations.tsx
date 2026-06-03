"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface RelationLink {
  label: string;
  href: string;
  value: string | number;
  color?: string;
}

interface ModuleRelationsProps {
  title?: string;
  links: RelationLink[];
  className?: string;
}

/** Cross-module links shown on module pages (tasks ↔ goals, etc.) */
export function ModuleRelations({
  title = "Connected modules",
  links,
  className,
}: ModuleRelationsProps) {
  if (links.length === 0) return null;

  return (
    <Card className={cn("border border-dashed bg-muted/20 shadow-none", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="group inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: link.color ?? "#6366f1" }}
            />
            <span className="text-muted-foreground">{link.label}</span>
            <span className="font-medium tabular-nums">{link.value}</span>
            <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
