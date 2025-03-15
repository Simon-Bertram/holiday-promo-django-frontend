"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authService } from "@/features/auth/hooks/use-auth";
import { useAsyncOperation, useFormError } from "@/shared/lib/error";
import {
  LoginForm,
  EmailFormValues,
} from "@/features/auth/components/login-form";
import {
  CaptchaVerification,
  MagicCodeSent,
} from "@/features/auth/components/magic-code-form";

// Authentication flow stages
enum Stage {
  EMAIL_ENTRY, // Step 1: Enter email
  CAPTCHA_VERIFICATION, // Step 2: Complete CAPTCHA
  MAGIC_CODE_SENT, // Step 3: Magic code sent, await verification
}

export default function LoginPage() {
  const { handleError } = useFormError();
  const { requestMagicCode } = authService;

  const [stage, setStage] = useState<Stage>(Stage.EMAIL_ENTRY);
  const [userEmail, setUserEmail] = useState<string>("");

  // Check if user exists and send magic code
  const { execute: executeRequestMagicCode, isLoading: isMagicCodeLoading } =
    useAsyncOperation(requestMagicCode, {
      onSuccess: () => {
        setStage(Stage.MAGIC_CODE_SENT);
        toast.success(
          "If your email exists in our system, a magic code has been sent to it"
        );
      },
    });

  // Handle email submission
  const onEmailSubmit = async (values: EmailFormValues) => {
    setUserEmail(values.email);
    setStage(Stage.CAPTCHA_VERIFICATION);
  };

  // Handle CAPTCHA verification
  const onCaptchaChange = async (token: string | null) => {
    if (token) {
      try {
        // After CAPTCHA verification, check if user exists and send magic code
        await executeRequestMagicCode({
          email: userEmail,
          captcha_token: token,
        });
      } catch (error) {
        // For security, don't reveal if email doesn't exist
        setStage(Stage.MAGIC_CODE_SENT);
        toast.success(
          "If your email exists in our system, a magic code has been sent to it"
        );

        // Only log actual errors
        if (
          error instanceof Error &&
          !error.message.includes("No user with this email address")
        ) {
          handleError(error);
        }
      }
    }
  };

  // Determine if any operation is loading
  const isLoading = isMagicCodeLoading;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          {stage === Stage.EMAIL_ENTRY && "Enter your email to begin"}
          {stage === Stage.CAPTCHA_VERIFICATION && "Verify you're human"}
          {stage === Stage.MAGIC_CODE_SENT &&
            "Check your email for the verification code"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stage === Stage.EMAIL_ENTRY && (
          <LoginForm onSubmit={onEmailSubmit} isLoading={isLoading} />
        )}

        {stage === Stage.CAPTCHA_VERIFICATION && (
          <CaptchaVerification
            onCaptchaChange={onCaptchaChange}
            isLoading={isLoading}
          />
        )}

        {stage === Stage.MAGIC_CODE_SENT && <MagicCodeSent email={userEmail} />}
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
}
