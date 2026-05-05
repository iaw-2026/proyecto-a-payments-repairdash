import { Button } from "@/components/ui/Button";

export function DisputeActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button>Resolver</Button>
      <Button variant="secondary">Marcar disputa</Button>
    </div>
  );
}