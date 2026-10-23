import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { stateTransition } from './motionPresets'

type TableProps = {
  children: ReactNode
}

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  )
}

type CellAlignment = 'left' | 'right'

type TableHeaderCellProps = ThHTMLAttributes<HTMLTableCellElement> & {
  align?: CellAlignment
}

export function TableHeaderCell({ align = 'left', className = '', ...cellProps }: TableHeaderCellProps) {
  return (
    <th
      scope="col"
      className={`section-label h-11 px-4 font-medium whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}
      {...cellProps}
    />
  )
}

// Rows fade in and out. Render them inside AnimatePresence so removed rows can animate out.
export function TableRow({ className = '', ...rowProps }: HTMLMotionProps<'tr'>) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={stateTransition}
      className={`border-t border-border transition-colors duration-200 ease-fluid hover:bg-hover/60 ${className}`}
      {...rowProps}
    />
  )
}

type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  align?: CellAlignment
}

export function TableCell({ align = 'left', className = '', ...cellProps }: TableCellProps) {
  return <td className={`h-13 px-4 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`} {...cellProps} />
}
