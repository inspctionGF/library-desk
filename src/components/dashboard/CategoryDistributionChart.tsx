import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useLibraryStore } from '@/hooks/useLibraryStore';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function CategoryDistributionChart() {
  const { books, categories } = useLibraryStore();

  const data = categories.map((category, index) => {
    const bookCount = books.filter(b => b.categoryId === category.id).length;
    return {
      name: category.name,
      value: bookCount,
      color: COLORS[index % COLORS.length],
    };
  }).filter(item => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Livres par catégorie</CardTitle>
        <p className="text-xs text-muted-foreground">Répartition du catalogue</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number, name: string) => [`${value} livres`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {data.slice(0, 4).map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="h-2.5 w-2.5 rounded-full shrink-0" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="text-xs text-muted-foreground truncate">{item.name}</span>
              <span className="text-xs font-medium ml-auto">{Math.round((item.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
