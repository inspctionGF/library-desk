import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', livres: 12 },
  { name: 'Fév', livres: 19 },
  { name: 'Mar', livres: 15 },
  { name: 'Avr', livres: 22 },
  { name: 'Mai', livres: 28 },
  { name: 'Jun', livres: 18 },
];

export function MonthlyBooksChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Livres empruntés</CardTitle>
        <p className="text-xs text-muted-foreground">Tendance sur 6 mois</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                formatter={(value: number) => [`${value} livres`, 'Empruntés']}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              />
              <Bar 
                dataKey="livres" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
