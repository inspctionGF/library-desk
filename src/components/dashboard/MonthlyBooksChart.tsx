import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLibraryStore } from '@/hooks/useLibraryStore';

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export function MonthlyBooksChart() {
  const { loans } = useLibraryStore();

  const data = useMemo(() => {
    const today = new Date();
    const last6Months: { name: string; livres: number; month: string }[] = [];

    // Générer les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthName = MONTHS_FR[month];

      // Compter les prêts pour ce mois
      const loansCount = loans.filter(l => {
        const loanDate = new Date(l.loanDate);
        return loanDate.getFullYear() === year && loanDate.getMonth() === month;
      }).length;

      last6Months.push({
        name: monthName,
        livres: loansCount,
        month: `${year}-${String(month + 1).padStart(2, '0')}`,
      });
    }

    return last6Months;
  }, [loans]);
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
