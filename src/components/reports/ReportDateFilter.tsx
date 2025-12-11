import { useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type DateFilterType = "all" | "month" | "range";

interface DateFilter {
  type: DateFilterType;
  startDate: Date | null;
  endDate: Date | null;
}

interface ReportDateFilterProps {
  value: DateFilter;
  onChange: (filter: DateFilter) => void;
}

const ReportDateFilter = ({ value, onChange }: ReportDateFilterProps) => {
  const [filterType, setFilterType] = useState<DateFilterType>(value.type);

  const handleTypeChange = (type: DateFilterType) => {
    setFilterType(type);
    if (type === "all") {
      onChange({ type: "all", startDate: null, endDate: null });
    } else if (type === "month") {
      const now = new Date();
      onChange({
        type: "month",
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      });
    }
  };

  const handleMonthSelect = (monthsAgo: number) => {
    const date = subMonths(new Date(), monthsAgo);
    onChange({
      type: "month",
      startDate: startOfMonth(date),
      endDate: endOfMonth(date),
    });
  };

  const handleDateChange = (date: Date | undefined, field: "startDate" | "endDate") => {
    if (date) {
      onChange({
        ...value,
        type: "range",
        [field]: date,
      });
    }
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: i.toString(),
      label: format(date, "MMMM yyyy", { locale: fr }),
    };
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      
      <Select value={filterType} onValueChange={(v) => handleTypeChange(v as DateFilterType)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tout</SelectItem>
          <SelectItem value="month">Par mois</SelectItem>
          <SelectItem value="range">Intervalle</SelectItem>
        </SelectContent>
      </Select>

      {filterType === "month" && (
        <Select onValueChange={(v) => handleMonthSelect(parseInt(v))}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sélectionner un mois" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {filterType === "range" && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[130px] justify-start text-left font-normal",
                  !value.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value.startDate ? format(value.startDate, "dd/MM/yyyy") : "Début"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value.startDate || undefined}
                onSelect={(d) => handleDateChange(d, "startDate")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <span className="text-muted-foreground">à</span>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[130px] justify-start text-left font-normal",
                  !value.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value.endDate ? format(value.endDate, "dd/MM/yyyy") : "Fin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value.endDate || undefined}
                onSelect={(d) => handleDateChange(d, "endDate")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default ReportDateFilter;
export type { DateFilter };
