/**
 * Utility function to export data to an Excel-compatible CSV file.
 * Includes UTF-8 BOM (\uFEFF) to ensure Vietnamese characters display correctly in Excel.
 */
export function exportToExcel(
  data: any[],
  headers: string[],
  keys: string[],
  filename: string
) {
  const BOM = '\uFEFF';
  const csvRows = [];

  // Header row - wrap headers in quotes to prevent delimiter issues
  const escapedHeaders = headers.map(h => `"${String(h).replace(/"/g, '""')}"`);
  csvRows.push(escapedHeaders.join(','));

  // Data rows
  for (const item of data) {
    const rowValues = keys.map(key => {
      // Get value from nested key if necessary (e.g., 'customer.name')
      let val = item;
      const path = key.split('.');
      for (const p of path) {
        val = val ? val[p] : '';
      }

      if (val === undefined || val === null) {
        val = '';
      } else {
        // Formatter/cleaner for common types
        if (typeof val === 'object') {
          val = JSON.stringify(val);
        }
        val = String(val).replace(/"/g, '""'); // Escape inner quotes
      }
      return `"${val}"`; // Wrap in quotes
    });
    csvRows.push(rowValues.join(','));
  }

  const csvContent = BOM + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
