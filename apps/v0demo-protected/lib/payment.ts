// Demo-only payment validation helpers.
// These accept ONLY known test values. No data ever leaves the browser.

export const TEST_CARDS = ['4111111111111111', '4242424242424242']

export const SAMPLE_CARDS = ['4111 1111 1111 1111', '4242 4242 4242 4242']

export function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function maskCard(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 4) return '•••• •••• •••• ••••'
  return `•••• •••• •••• ${digits.slice(-4)}`
}

export function isTestCard(value: string) {
  return TEST_CARDS.includes(value.replace(/\D/g, ''))
}

export function isValidExpiry(value: string) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value)
  if (!match) return false
  const month = Number(match[1])
  return month >= 1 && month <= 12
}

export function isValidCvv(value: string) {
  return /^\d{3}$/.test(value)
}
