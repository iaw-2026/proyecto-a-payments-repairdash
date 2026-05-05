import { Button } from "@/components/ui/Button";

export function CheckoutForm() {
  return (
    <form action="/api/payments/checkout" method="post" className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl">
      <input name="clientId" placeholder="clientId" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none" />
      <input name="trabajadorId" placeholder="trabajadorId" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none" />
      <input name="amount" placeholder="amount" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none" />
      <Button type="submit">Enviar checkout</Button>
    </form>
  );
}