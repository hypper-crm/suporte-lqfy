import { clients } from '../../i18n/pt-BR'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { Table, TableCell, TableHeaderCell } from '../ui/Table'

const placeholderRowCount = 6

export function ClientTableSkeleton() {
  return (
    <div role="status" aria-label={clients.loading}>
      {/* Mirrors the client cards shown below the md breakpoint. */}
      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: placeholderRowCount }, (_, index) => (
          <Card key={index} className="flex flex-col gap-3 p-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3.5 w-44" />
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          </Card>
        ))}
      </div>
      <div className="max-md:hidden">
        <Table>
        <thead>
          <tr>
            <TableHeaderCell>{clients.columns.name}</TableHeaderCell>
            <TableHeaderCell>{clients.columns.email}</TableHeaderCell>
            <TableHeaderCell>{clients.columns.niche}</TableHeaderCell>
            <TableHeaderCell align="right">{clients.columns.payInRate}</TableHeaderCell>
            <TableHeaderCell align="right">{clients.columns.payOutRate}</TableHeaderCell>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: placeholderRowCount }, (_, index) => (
            <tr key={index} className="border-t border-border">
              <TableCell>
                <Skeleton className="h-3.5 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3.5 w-44" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-3.5 w-14" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-3.5 w-14" />
              </TableCell>
            </tr>
          ))}
        </tbody>
        </Table>
      </div>
    </div>
  )
}
