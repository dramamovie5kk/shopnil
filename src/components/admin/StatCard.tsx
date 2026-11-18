import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type StatVariant = "primary" | "success" | "warning" | "info" | "danger" | "purple";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: StatVariant;
  trend?: { value: number; label?: string };
  href?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const variantClasses: Record<StatVariant, string> = {
  primary: "admin-stat-primary",
  success: "admin-stat-success",
  warning: "admin-stat-warning",
  info: "admin-stat-info",
  danger: "admin-stat-danger",
  purple: "admin-stat-purple",
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  variant = "primary",
  trend,
  href,
  prefix,
  suffix,
  className,
}: StatCardProps) => {
  const content = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card border border-admin-border/50 p-5",
        "shadow-admin-card hover:shadow-admin-elevated transition-all duration-300",
        "hover:-translate-y-0.5",
        className
      )}
    >
      {/* Gradient accent strip on left */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5",
          variantClasses[variant]
        )}
      />

      {/* Decorative blob */}
      <div
        className={cn(
          "absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-[0.07] blur-xl transition-opacity duration-300 group-hover:opacity-[0.12]",
          variantClasses[variant]
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80 mb-2">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            {prefix && (
              <span className="text-lg font-semibold text-foreground/70">{prefix}</span>
            )}
            <span className="text-3xl font-bold text-foreground tabular-nums tracking-tight">
              {value}
            </span>
            {suffix && (
              <span className="text-sm font-medium text-muted-foreground ml-0.5">{suffix}</span>
            )}
          </div>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                  trend.value >= 0
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-rose-500/10 text-rose-600"
                )}
              >
                {trend.value >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-[11px] text-muted-foreground">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            "shrink-0 rounded-xl p-2.5 text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
            variantClasses[variant]
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
};

export default StatCard;