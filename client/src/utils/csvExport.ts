export const downloadCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Convert array of objects to CSV string
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(fieldName => {
        let value = row[fieldName] === null || row[fieldName] === undefined ? '' : row[fieldName];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""');
          if (value.includes(',')) {
            value = `"${value}"`;
          }
        }
        return value;
      }).join(',')
    )
  ];
  
  const csvString = csvRows.join('\n');
  
  // Create blob and download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
