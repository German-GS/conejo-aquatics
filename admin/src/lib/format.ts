export function formatColones(amount: number): string {
  return `₡${amount.toLocaleString("es-CR", { maximumFractionDigits: 0 })}`;
}
