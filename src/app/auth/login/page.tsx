"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import {
  CaptchaVerification,
  MagicCodeSent,
} from "@/features/auth/components/magic-code-form";
import { useLoginFlow, LoginStage } from "@/features/auth/hooks/use-login-flow";
import { ErrorBoundary } from "@/shared/lib/error/components/error-boundary";

export default function LoginPage() {
  const {
    stage,
    userEmail,
    isLoading,
    handleEmailSubmit,
    handleCaptchaChange,
  } = useLoginFlow();

  const renderContent = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          {stage === LoginStage.EMAIL_ENTRY && "Enter your email to begin"}
          {stage === LoginStage.CAPTCHA_VERIFICATION && "Verify you're human"}
          {stage === LoginStage.MAGIC_CODE_SENT &&
            "Check your email for the verification code"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stage === LoginStage.EMAIL_ENTRY && (
          <LoginForm onSubmitAction={handleEmailSubmit} isLoading={isLoading} />
        )}

        {stage === LoginStage.CAPTCHA_VERIFICATION && (
          <CaptchaVerification
            onCaptchaChangeAction={handleCaptchaChange}
            isLoading={isLoading}
          />
        )}

        {stage === LoginStage.MAGIC_CODE_SENT && (
          <MagicCodeSent email={userEmail} />
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="underline">
            Register
          </Link>
        </div>
      </CardFooter>
    </Card>
  );

  return <ErrorBoundary>{renderContent()}</ErrorBoundary>;
}
