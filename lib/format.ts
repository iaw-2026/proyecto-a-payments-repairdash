export function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return "-";
  }

  return value.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function shortId(id: string, visible = 8) {
  return id.length > visible ? `...${id.slice(-visible)}` : id;
}
