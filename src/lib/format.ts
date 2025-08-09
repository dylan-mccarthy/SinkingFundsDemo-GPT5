/** Format cents as currency string (AUD by default). */
export function cents(amountCents: number, locale = 'en-AU', currency = 'AUD') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format((amountCents ?? 0) / 100);
}
