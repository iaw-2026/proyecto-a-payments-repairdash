import { SignIn, SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-lg border border-border bg-surface/70 p-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">
            Ya hay una sesión activa
          </h1>
          <p className="mt-3 text-sm leading-6 text-secondary">
            Cerrá la sesión actual para volver a intentar el inicio de sesión
            con otra cuenta.
          </p>
          <div className="mt-6">
            <SignOutButton redirectUrl="/sign-in">
              <button
                type="button"
                className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-hover"
              >
                Cerrar sesión y volver a intentar
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <SignIn
        path="/sign-in"
        routing="path"
        appearance={{
          elements: {
            footerAction: {
              display: "none",
            },
          },
        }}
        fallbackRedirectUrl="/dashboard"
        transferable={false}
        withSignUp={false}
      />
    </div>
  );
}
