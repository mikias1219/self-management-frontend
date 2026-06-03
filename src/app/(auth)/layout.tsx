import { Hexagon } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Hexagon className="size-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">LifeOS</h1>
          <p className="text-xs text-muted-foreground">Your personal operating system</p>
        </div>
      </div>
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg">
        {children}
      </div>
    </div>
  );
}
