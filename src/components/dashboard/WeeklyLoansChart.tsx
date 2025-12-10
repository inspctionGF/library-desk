import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Lun', prêts: 4, retours: 2 },
  { name: 'Mar', prêts: 6, retours: 4 },
  { name: 'Mer', prêts: 8, retours: 5 },
  { name: 'Jeu', prêts: 5, retours: 7 },
  { name: 'Ven', prêts: 9, retours: 6 },
  { name: 'Sam', prêts: 3, retours: 4 },
  { name: 'Dim', prêts: 2, retours: 3 },
];

export function WeeklyLoansChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Activité de la semaine</CardTitle>
        <p className="text-xs text-muted-foreground">Prêts et retours des 7 derniers jours</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRetours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
              />
              <Area
                type="monotone"
                dataKey="prêts"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrets)"
              />
              <Area
                type="monotone"
                dataKey="retours"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRetours)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Prêts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
            <span className="text-xs text-muted-foreground">Retours</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
