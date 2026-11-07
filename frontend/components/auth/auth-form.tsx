"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useGoogleLogin, useLogin, useSignUp } from "@/hooks/use-auth";
import {
  loginSchema,
  signUpSchema,
  type LoginFormValues,
  type SignUpFormValues,
} from "@/lib/validations/auth";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const login = useLogin();
  const googleLogin = useGoogleLogin();
  const registerUser = useSignUp();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
  });

  const pending = (isLogin ? login.isPending : registerUser.isPending) || googleLogin.isPending;
  const error = (isLogin ? login.error : registerUser.error) ?? googleLogin.error;
  const googleConfigured = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const errorMessage =
    error instanceof Error ? error.message : isLogin ? "Unable to sign in" : "Unable to create account";

  if (isLogin) {
    const { register, handleSubmit, formState } = loginForm;

    return (
      <form
        onSubmit={handleSubmit((values) => login.mutate(values))}
        className="space-y-6"
      >
        <FieldGroup>
          <Field data-invalid={!!formState.errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!formState.errors.email}
              {...register("email")}
            />
            <FieldError errors={[formState.errors.email]} />
          </Field>

          <Field data-invalid={!!formState.errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={!!formState.errors.password}
              {...register("password")}
            />
            <FieldError errors={[formState.errors.password]} />
          </Field>
        </FieldGroup>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Spinner />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        {googleConfigured && (
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or continue with</span>
              </div>
            </div>
            <GoogleSignInButton
              onCredential={googleLogin.mutate}
              disabled={pending}
            />
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    );
  }

  const { register, handleSubmit, formState } = registerForm;

  return (
    <form
      onSubmit={handleSubmit((values) => registerUser.mutate(values))}
      className="space-y-6"
    >
      <FieldGroup>
        <Field data-invalid={!!formState.errors.displayName}>
          <FieldLabel htmlFor="displayName">Display name</FieldLabel>
          <Input
            id="displayName"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!formState.errors.displayName}
            {...register("displayName")}
          />
          <FieldError errors={[formState.errors.displayName]} />
        </Field>

        <Field data-invalid={!!formState.errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!formState.errors.email}
            {...register("email")}
          />
          <FieldError errors={[formState.errors.email]} />
        </Field>

        <Field data-invalid={!!formState.errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            aria-invalid={!!formState.errors.password}
            {...register("password")}
          />
          <FieldError errors={[formState.errors.password]} />
        </Field>
      </FieldGroup>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Spinner />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      {googleConfigured && (
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>
          <GoogleSignInButton
            onCredential={googleLogin.mutate}
            disabled={pending}
          />
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}