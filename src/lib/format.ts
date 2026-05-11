// Number and currency formatting utilities

export function formatCash(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(2)}B`
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`
  }
  return `$${amount.toLocaleString()}`
}

export function formatNumber(amount: number): string {
  return amount.toLocaleString()
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function formatNetworth(value: number): string {
  return formatCash(value)
}
