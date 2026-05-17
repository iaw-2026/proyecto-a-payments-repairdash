import { SignIn, SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

type SignInPageProps = {
  searchParams: Promise<{
    redirect_url?: string | string[];
  }>;
};

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSafeRedirectUrl(value: string | undefined, requestHost: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsedUrl = new URL(value, "http://localhost");
    const isRelativeUrl = parsedUrl.origin === "http://localhost";
    const isSameHostUrl =
      requestHost !== null &&
      parsedUrl.host.toLowerCase() === requestHost.toLowerCase();

    if (!isRelativeUrl && !isSameHostUrl) {
      return null;
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return null;
  }
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { userId } = await auth();
  const requestHeaders = await headers();
  const { redirect_url: rawRedirectUrl } = await searchParams;
  const redirectUrl = getSafeRedirectUrl(
    firstSearchValue(rawRedirectUrl),
    requestHeaders.get("host"),
  );
  const signInUrl = redirectUrl
    ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/sign-in";

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
            <SignOutButton redirectUrl={signInUrl}>
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
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl="/dashboard"
        transferable={false}
        withSignUp={false}
      />
    </div>
  );
}
