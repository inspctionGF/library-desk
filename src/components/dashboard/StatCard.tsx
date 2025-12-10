import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'accent';
  trend?: {
    value: string;
    positive?: boolean;
  };
}

export function StatCard({ title, value, subtitle, icon, variant = 'default', trend }: StatCardProps) {
  return (
    <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>{title}</span>
            <HelpCircle className="h-3.5 w-3.5" />
          </div>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <div className="flex items-center gap-2">
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
            {trend && (
              <span className={cn(
                "text-xs font-medium",
                trend.positive ? "text-success" : "text-accent"
              )}>
                {trend.value}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}