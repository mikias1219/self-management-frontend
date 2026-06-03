import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <>
      <h2 className="mb-1 text-center text-lg font-semibold">Welcome back</h2>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Sign in to your LifeOS account
      </p>
      <AuthForm mode="login" />
    </>
  );
}
