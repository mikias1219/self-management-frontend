"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useStandMutation } from "@/hooks/use-stand-data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { getRealtimeSocket } from "@/lib/realtime/socket";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = loginSchema.extend({
  displayName: z.string().min(2),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

function LoginFormFields() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useStandMutation(authApi.login, {
    onSuccess: () => {
      getRealtimeSocket();
      router.push("/");
    },
  });

  return (
    <AuthFormShell
      isRegister={false}
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      isPending={mutation.isPending}
      isError={mutation.isError}
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>
    </AuthFormShell>
  );
}

function RegisterFormFields() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useStandMutation(authApi.register, {
    onSuccess: () => {
      getRealtimeSocket();
      router.push("/");
    },
  });

  return (
    <AuthFormShell
      isRegister
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      isPending={mutation.isPending}
      isError={mutation.isError}
    >
      <div className="space-y-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" {...register("displayName")} />
        {errors.displayName && (
          <p className="text-xs text-destructive">
            {errors.displayName.message}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>
    </AuthFormShell>
  );
}

function AuthFormShell({
  children,
  isRegister,
  onSubmit,
  isPending,
  isError,
}: {
  children: React.ReactNode;
  isRegister: boolean;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  isError: boolean;
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {children}
      {isError && (
        <p className="text-sm text-destructive">
          Authentication failed. Check credentials and API connection.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? "Please wait..."
          : isRegister
            ? "Create account"
            : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            No account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  return mode === "register" ? <RegisterFormFields /> : <LoginFormFields />;
}
