import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { login } from "@/app/actions/auth";

type LoginPageProps = {
  searchParams: Promise<{ signedUp?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { signedUp } = await searchParams;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to your notebooks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {signedUp && (
          <div
            role="status"
            className="mb-4 rounded-md border border-green-400/30 bg-green-500/10 px-3 py-2 text-sm text-green-100"
          >
            Check your inbox to confirm your email, then sign in.
          </div>
        )}

        <form action={login} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              placeholder="••••••••"
            />
          </div>

          <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Monolith?{" "}
          <Link
            href="/signup"
            className="font-medium text-green-400 underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
