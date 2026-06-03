import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <>
      <h2 className="mb-1 text-center text-lg font-semibold">Create account</h2>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Start organizing your life with LifeOS
      </p>
      <AuthForm mode="register" />
    </>
  );
}
