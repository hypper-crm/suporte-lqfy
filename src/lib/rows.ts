// Helpers for lists of database rows kept in React state.

export function upsertById<Row extends { id: string }>(rows: Row[], row: Row): Row[] {
  const exists = rows.some((current) => current.id === row.id)
  return exists ? rows.map((current) => (current.id === row.id ? row : current)) : [...rows, row]
}

export function removeById<Row extends { id: string }>(rows: Row[], id: string): Row[] {
  return rows.filter((row) => row.id !== id)
}

function hasPatch<Row>(row: Row, patch: Partial<Row>): boolean {
  return (Object.keys(patch) as (keyof Row)[]).every((field) => row[field] === patch[field])
}

export function applyPatch<Row extends { id: string }>(rows: Row[], id: string, patch: Partial<Row>): Row[] {
  return rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
}

// Optimistic updates: once the request finishes, the row is only touched if nobody changed it again in the meantime.
export function replacePatchedRow<Row extends { id: string }>(rows: Row[], savedRow: Row, patch: Partial<Row>): Row[] {
  return rows.map((row) => (row.id === savedRow.id && hasPatch(row, patch) ? savedRow : row))
}

export function revertPatch<Row extends { id: string }>(rows: Row[], previousRow: Row, patch: Partial<Row>): Row[] {
  const previousValues = Object.fromEntries(
    (Object.keys(patch) as (keyof Row)[]).map((field) => [field, previousRow[field]]),
  ) as Partial<Row>
  return rows.map((row) => (row.id === previousRow.id && hasPatch(row, patch) ? { ...row, ...previousValues } : row))
}
