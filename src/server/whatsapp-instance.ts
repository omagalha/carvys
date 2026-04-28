export function whatsappInstanceName(tenantId: string): string {
  return `carvys-${tenantId.replace(/-/g, '').slice(0, 12)}`
}
