import { useState, useMemo } from "react";
import { useLibraryStore, ExtraActivity } from "@/hooks/useLibraryStore";
import { parseISO, isWithinInterval, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Sparkles, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import ReportStatCard from "./ReportStatCard";
import ReportDateFilter, { DateFilter } from "./ReportDateFilter";
import ExportReportButton from "./ExportReportButton";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/usePagination";

interface EnrichedActivity extends ExtraActivity {
  typeName: string;
  typeColor: string;
}

const ExtraActivityReportTab = () => {
  const { extraActivities, extraActivityTypes } = useLibraryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    type: "all",
    startDate: null,
    endDate: null,
  });

  // Filter activities by date and type
  const filteredActivities = useMemo(() => {
    let result = extraActivities;

    if (dateFilter.type !== "all" && dateFilter.startDate && dateFilter.endDate) {
      result = result.filter(a => {
        const date = parseISO(a.date);
        return isWithinInterval(date, {
          start: dateFilter.startDate!,
          end: dateFilter.endDate!,
        });
      });
    }

    if (typeFilter !== "all") {
      result = result.filter(a => a.activityTypeId === typeFilter);
    }

    return result;
  }, [extraActivities, dateFilter, typeFilter]);

  // Enrich with type info
  const enrichedActivities: EnrichedActivity[] = useMemo(() => {
    return filteredActivities.map(a => {
      const type = extraActivityTypes.find(t => t.id === a.activityTypeId);
      return {
        ...a,
        typeName: type?.name || "Type inconnu",
        typeColor: type?.color || "hsl(0, 0%, 50%)",
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredActivities, extraActivityTypes]);

  // Filter by search
  const searchedActivities = useMemo(() => {
    if (!searchTerm) return enrichedActivities;
    const term = searchTerm.toLowerCase();
    return enrichedActivities.filter(
      a =>
        a.typeName.toLowerCase().includes(term) ||
        a.memo.toLowerCase().includes(term)
    );
  }, [enrichedActivities, searchTerm]);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    itemsPerPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination<EnrichedActivity>({ data: searchedActivities, itemsPerPage: 10 });

  // Stats by type
  const statsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredActivities.forEach(a => {
      counts[a.activityTypeId] = (counts[a.activityTypeId] || 0) + 1;
    });
    return extraActivityTypes.map(t => ({
      id: t.id,
      name: t.name,
      color: t.color,
      count: counts[t.id] || 0,
    })).filter(t => t.count > 0);
  }, [filteredActivities, extraActivityTypes]);

  // Most popular type
  const mostPopularType = useMemo(() => {
    if (statsByType.length === 0) return null;
    return statsByType.reduce((max, t) => (t.count > max.count ? t : max), statsByType[0]);
  }, [statsByType]);

  // Chart data
  const chartData = statsByType.map(t => ({
    name: t.name,
    value: t.count,
    color: t.color,
  }));

  // Export data
  const exportData = searchedActivities.map(a => ({
    date: format(parseISO(a.date), "dd/MM/yyyy"),
    type: a.typeName,
    memo: a.memo,
  }));

  const exportColumns = [
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
    { key: "memo", label: "Mémo" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ReportStatCard
          title="Total activités"
          value={filteredActivities.length}
          icon={Sparkles}
          variant="primary"
        />
        <ReportStatCard
          title="Types d'activités"
          value={extraActivityTypes.length}
          icon={Calendar}
        />
        <ReportStatCard
          title="Type le plus fréquent"
          value={mostPopularType?.name || "-"}
          subtitle={mostPopularType ? `${mostPopularType.count} activités` : undefined}
          icon={Sparkles}
          variant="success"
        />
        <ReportStatCard
          title="Ce mois"
          value={filteredActivities.filter(a => {
            const date = parseISO(a.date);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          }).length}
          icon={Calendar}
          variant="warning"
        />
      </div>

      {/* Chart and Table */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pie Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Distribution par type</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune donnée à afficher
              </p>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col space-y-4 pb-4">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Liste des activités</CardTitle>
              <ExportReportButton
                data={exportData}
                filename="rapport_activites_extra"
                columns={exportColumns}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <ReportDateFilter value={dateFilter} onChange={setDateFilter} />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type d'activité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {extraActivityTypes.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: t.color }}
                        />
                        {t.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mémo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        Aucune activité trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          {format(parseISO(activity.date), "dd MMM yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={{
                              backgroundColor: `${activity.typeColor}20`,
                              color: activity.typeColor,
                            }}
                          >
                            {activity.typeName}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {activity.memo}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExtraActivityReportTab;
