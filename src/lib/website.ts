// Accepts only absolute http and https addresses with a host name.
export function isValidWebsite(value: string): boolean {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.')
  } catch {
    return false
  }
}

// The address without the protocol and the trailing slash, for display.
export function formatWebsite(website: string): string {
  return website.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}
