export function centsToReais(cents: number): number {
  return cents / 100;
}

export function formatCurrency(valueInCents: number, locale: string): string {
  const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';
  const reais = valueInCents / 100;
  if (Math.abs(reais) >= 1000) {
    return (reais / 1000).toLocaleString(loc, { maximumFractionDigits: 1 }) + 'k';
  }
  return reais.toLocaleString(loc, { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
}
