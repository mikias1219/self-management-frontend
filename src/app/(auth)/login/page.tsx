import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { LoginRedirect } from "@/components/auth/login-redirect";

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <LoginRedirect />
      </Suspense>
      <h2 className="mb-1 text-center text-lg font-semibold">Welcome back</h2>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Sign in to your LifeOS account
      </p>
      <AuthForm mode="login" />
    </>
  );
}
