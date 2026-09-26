function parseLine(line: string): string[] {
  const cells: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') { current += '"'; i++ }
      else if (char === '"') inQuotes = false
      else current += char
    } else if (char === '"') inQuotes = true
    else if (char === ",") { cells.push(current); current = "" }
    else current += char
  }
  cells.push(current)
  return cells.map((c) => c.trim())
}

function escapeCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value)
  // Célula com vírgula, aspas ou quebra de linha precisa ir entre aspas, com as
  // aspas internas duplicadas — senão o arquivo desalinha ao ser reaberto.
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Serializa linhas em CSV. `columns` define a ordem e o cabeçalho. */
export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: Array<{ key: keyof T; header: string }>,
): string {
  const head = columns.map((column) => escapeCell(column.header)).join(",")
  const body = rows.map((row) => columns.map((column) => escapeCell(row[column.key])).join(","))
  return [head, ...body].join("\r\n")
}

export function downloadCsv(filename: string, content: string) {
  // BOM para o Excel reconhecer UTF-8 e não quebrar acentuação.
  const blob = new Blob([`﻿${content}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function parseUserCsv(text: string): { name: string; email: string; role: string }[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return []

  const header = parseLine(lines[0]).map((h) => h.toLowerCase())
  const nameIdx = header.indexOf("name") !== -1 ? header.indexOf("name") : header.indexOf("nome")
  const emailIdx = header.indexOf("email") !== -1 ? header.indexOf("email") : header.indexOf("e-mail")
  const roleIdx = header.indexOf("role") !== -1 ? header.indexOf("role") : header.indexOf("perfil")

  if (nameIdx === -1 || emailIdx === -1 || roleIdx === -1) {
    throw new Error("O CSV precisa ter as colunas: name, email, role")
  }

  return lines.slice(1).map((line) => {
    const cells = parseLine(line)
    return { name: cells[nameIdx] ?? "", email: cells[emailIdx] ?? "", role: cells[roleIdx] ?? "" }
  })
}
