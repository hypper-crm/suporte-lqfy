import { clients } from '../../i18n/pt-BR'
import { Skeleton } from '../ui/Skeleton'
import { Table, TableCell, TableHeaderCell } from '../ui/Table'

const placeholderRowCount = 6

export function ClientTableSkeleton() {
  return (
    <div role="status" aria-label={clients.loading}>
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
  )
}
