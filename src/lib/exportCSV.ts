export function exportToCsv(data: any[], filename: string = 'export.csv') {
  if (!data || !data.length) {
    alert('No data to export')
    return
  }

  // Define headers for buyer data
  const headers = [
    'Full Name',
    'Phone',
    'Email',
    'City',
    'Property Type',
    'BHK',
    'Purpose',
    'Budget Min',
    'Budget Max',
    'Timeline',
    'Source',
    'Status',
    'Notes',
    'Tags',
    'Created At'
  ]

  const csvRows = []

  // Add header row
  csvRows.push(headers.join(','))

  // Add data rows
  for (const buyer of data) {
    const row = [
      buyer.fullName,
      buyer.phone,
      buyer.email || '',
      buyer.city,
      buyer.propertyType,
      buyer.bhk || '',
      buyer.purpose,
      buyer.budgetMin || '',
      buyer.budgetMax || '',
      buyer.timeline,
      buyer.source,
      buyer.status,
      buyer.notes || '',
      buyer.tags || '',
      new Date(buyer.createdAt).toLocaleDateString()
    ]

    // Escape commas and quotes in data
    const escapedRow = row.map(field => {
      const str = String(field)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })

    csvRows.push(escapedRow.join(','))
  }

  // Create and download file
  const csvString = csvRows.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
