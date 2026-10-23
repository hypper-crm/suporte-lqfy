export function openUrlInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}

// The URL must be served as an attachment (Content-Disposition), so the browser downloads it instead of navigating.
export function startDownload(url: string): void {
  const link = document.createElement('a')
  link.href = url
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
