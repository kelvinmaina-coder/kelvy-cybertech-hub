import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  variant?: "green" | "cyan" | "red" | "orange" | "purple";
}

const variantStyles = {
  green: "border-glow-green text-primary",
  cyan: "border-glow-cyan text-secondary",
  red: "glow-red border-destructive/40 text-destructive",
  orange: "border-warning/40 text-warning",
  purple: "glow-purple border-accent/40 text-accent",
};

export default function MetricCard({ title, value, change, icon: Icon, variant = "green" }: MetricCardProps) {
  return (
    <div className={`rounded-lg border bg-card p-4 transition-all hover:scale-[1.02] ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">{title}</span>
        <Icon className="w-4 h-4 opacity-70" />
      </div>
      <div className="text-2xl font-display font-bold">{value}</div>
      {change && <p className="text-xs text-muted-foreground mt-1 font-mono">{change}</p>}
    </div>
  );
}
