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
