import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ReportStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

const variantStyles = {
  default: "bg-card",
  primary: "bg-primary/10 border-primary/20",
  success: "bg-emerald-500/10 border-emerald-500/20",
  warning: "bg-orange-500/10 border-orange-500/20",
  destructive: "bg-destructive/10 border-destructive/20",
};

const iconStyles = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-emerald-500",
  warning: "text-orange-500",
  destructive: "text-destructive",
};

const ReportStatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: ReportStatCardProps) => {
  return (
    <Card className={cn("border", variantStyles[variant])}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn("p-2 rounded-lg bg-background", iconStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportStatCard;
