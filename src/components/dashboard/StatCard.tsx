import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive';
}

const variantStyles = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  accent: 'bg-accent/10 text-accent',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({ title, value, subtitle, icon, variant = 'primary' }: StatCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-playful">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn('rounded-xl p-3', variantStyles[variant])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
