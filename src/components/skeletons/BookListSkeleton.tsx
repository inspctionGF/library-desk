import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface BookListSkeletonProps {
  rows?: number;
}

export function BookListSkeleton({ rows = 8 }: BookListSkeletonProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
          <TableHead><Skeleton className="h-4 w-12" /></TableHead>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-9 rounded shrink-0" />
                <Skeleton className="h-4 w-32" />
              </div>
            </TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
