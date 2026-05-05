export async function writeAuditEvent(event: string, details?: Record<string, unknown>) {
  console.log("audit", event, details ?? {});
}