"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
        className="flex w-full min-w-0 min-h-0 flex-1 flex-col gap-3 sm:gap-4 [@media(max-height:600px)]:gap-1"
      >
        <FieldGroup className="min-w-0 gap-3 sm:gap-5 [@media(max-height:600px)]:gap-2 [@media(max-height:440px)]:gap-1">
          <Field className="min-w-0 gap-1.5" data-invalid={!!formState.errors.email}>
            <FieldLabel className="text-sm font-medium [@media(max-height:440px)]:sr-only" htmlFor="email">Email</FieldLabel>
            <Input
              className="h-11 text-base placeholder:text-sm sm:h-10 [@media(max-height:600px)]:h-9 [@media(max-height:440px)]:h-7"
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!formState.errors.email}
              {...register("email")}
            />
            <FieldError errors={[formState.errors.email]} />
          </Field>

          <Field className="min-w-0 gap-1.5" data-invalid={!!formState.errors.password}>
            <FieldLabel className="text-sm font-medium [@media(max-height:440px)]:sr-only" htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                className="h-11 pr-10 text-base placeholder:text-sm sm:h-10 [@media(max-height:600px)]:h-9 [@media(max-height:440px)]:h-7"
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                aria-invalid={!!formState.errors.password}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(max-height:440px)]:size-6"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <FieldError errors={[formState.errors.password]} />
          </Field>
        </FieldGroup>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" className="h-11 w-full mt-2 text-sm sm:h-10 [@media(max-height:600px)]:h-9 [@media(max-height:440px)]:h-8" disabled={pending}>
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
          <div className="w-full min-w-0 space-y-2 sm:space-y-3 [@media(max-height:600px)]:space-y-1 [@media(max-height:340px)]:hidden">
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

        <p className="mt-auto px-1 pt-2 text-center text-sm leading-relaxed text-muted-foreground [@media(max-height:600px)]:pt-0 [@media(max-height:440px)]:text-xs [@media(max-height:440px)]:leading-none">
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
      className="flex w-full min-w-0 min-h-0 flex-1 flex-col gap-3 sm:gap-4 [@media(max-height:600px)]:gap-1"
    >
    <FieldGroup className="min-w-0 gap-3 sm:gap-5 [@media(max-height:600px)]:gap-2 [@media(max-height:440px)]:gap-1">
      <Field className="min-w-0 gap-1.5" data-invalid={!!formState.errors.displayName}>
        <FieldLabel className="text-sm font-medium [@media(max-height:440px)]:sr-only" htmlFor="displayName">Display name</FieldLabel>
          <Input
          className="h-11 text-base placeholder:text-sm sm:h-10 [@media(max-height:600px)]:h-9 [@media(max-height:440px)]:h-7"
            id="displayName"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!formState.errors.displayName}
            {...register("displayName")}
          />
          <FieldError errors={[formState.errors.displayName]} />
        </Field>

        <Field className="min-w-0 gap-1.5" data-invalid={!!formState.errors.email}>
          <FieldLabel className="text-sm font-medium [@media(max-height:440px)]:sr-only" htmlFor="email">Email</FieldLabel>
          <Input
            className="h-11 text-base placeholder:text-sm sm:h-10 [@media(max-height:600px)]:h-9 [@media(max-height:440px)]:h-7"
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!formState.errors.email}
            {...register("email")}
          />
          <FieldError errors={[formState.errors.email]} />
        </Field>

        <Field className="min-w-0 gap-1.5" data-invalid={!!formState.errors.password}>
          <FieldLabel className="text-sm font-medium [@media(max-height:440px)]:sr-only" htmlFor="password">Password</FieldLabel>
          <div className="relative">
            <Input
              className="h-11 pr-10 text-base placeholder:text-sm sm:h-10 [@media(max-height:600px)]:h-9 [@media(max-height:440px)]:h-7"
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              aria-invalid={!!formState.errors.password}
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(max-height:440px)]:size-6"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <FieldError errors={[formState.errors.password]} />
        </Field>
      </FieldGroup>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" className="h-11 w-full text-sm mt-2 sm:h-10 [@media(max-height:600px)]:h-9 [@media(max-height:440px)]:h-8" disabled={pending}>
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
        <div className="w-full min-w-0 space-y-2 sm:space-y-3 [@media(max-height:600px)]:space-y-1 [@media(max-height:340px)]:hidden">
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

      <p className="mt-auto px-1 pt-2 text-center text-sm leading-relaxed text-muted-foreground [@media(max-height:600px)]:pt-0 [@media(max-height:440px)]:text-xs [@media(max-height:440px)]:leading-none">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}