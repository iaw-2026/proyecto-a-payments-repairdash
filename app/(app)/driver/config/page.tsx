import { getAuthUser } from "@/lib/mock-auth";
import { getTrabajadorByClerkId } from "@/lib/services/users";
import { CbuConfigForm } from "@/components/driver/CbuConfigForm";

export const dynamic = "force-dynamic";

export default async function DriverConfigPage() {
  const { clerkId } = await getAuthUser();
  const trabajador = await getTrabajadorByClerkId(clerkId);

  // Default to empty string if no CBU is set yet
  const initialCbuCvu = trabajador?.cbuCvu || "";

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          Driver
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Configuración
        </h1>
        <p className="mt-1 text-secondary">
          Gestioná los datos de tu cuenta y preferencias.
        </p>
      </div>

      {/* ── Content ── */}
      <div className="rounded-xl border border-border bg-surface/70 p-6 backdrop-blur sm:p-8">
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          Cuenta Bancaria
        </h2>
        <div className="max-w-md">
          <CbuConfigForm initialCbuCvu={initialCbuCvu} />
        </div>
      </div>
    </div>
  );
}
