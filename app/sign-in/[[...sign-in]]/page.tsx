import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <SignIn
        path="/sign-in"
        routing="path"
        forceRedirectUrl="/dashboard"
        transferable={false}
        withSignUp={false}
      />
    </div>
  );
}
