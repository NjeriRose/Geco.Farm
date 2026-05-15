import { saveAs } from 'file-saver';

export function exportToCSV(
  data: Record<string, unknown>[],
  headers: { key: string; label: string }[],
  filename: string
) {
  if (data.length === 0) return;

  const headerRow = headers.map((h) => h.label).join(',');
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const value = row[h.key];
        if (value === null || value === undefined) return '';
        const str = String(value);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      })
      .join(',')
  );

  const csv = [headerRow, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${filename}.csv`);
}
