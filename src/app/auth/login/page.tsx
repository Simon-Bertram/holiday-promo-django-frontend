"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authService } from "@/features/auth/hooks/use-auth";
import { useAsyncOperation, useFormError } from "@/shared/lib/error";

// Stage 1: Email validation schema
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function LoginPage() {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { handleError } = useFormError();
  const { requestMagicCode } = authService;

  // Authentication flow stages
  enum Stage {
    EMAIL_ENTRY, // Step 1: Enter email
    CAPTCHA_VERIFICATION, // Step 2: Complete CAPTCHA
    MAGIC_CODE_SENT, // Step 3: Magic code sent, await verification
  }

  const [stage, setStage] = useState<Stage>(Stage.EMAIL_ENTRY);
  const [userEmail, setUserEmail] = useState<string>("");

  // Email form
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

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
  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
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

        // Reset captcha on error
        recaptchaRef.current?.reset();
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
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-4"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : "Continue"}
              </Button>
            </form>
          </Form>
        )}

        {stage === Stage.CAPTCHA_VERIFICATION && (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-center mb-4">
              Please complete the CAPTCHA verification to continue
            </p>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={
                process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
                // This is Google's test key that always passes verification
                // IMPORTANT: Replace with a real key before deployment to production
                "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              }
              onChange={onCaptchaChange}
            />
            {isLoading && (
              <p className="text-sm text-center mt-2">Processing...</p>
            )}
          </div>
        )}

        {stage === Stage.MAGIC_CODE_SENT && (
          <div className="text-center space-y-4">
            <p>
              We&apos;ve sent a 5-digit verification code to your email. Please
              check your inbox and enter the code on the verification page.
            </p>
            <Button
              onClick={() =>
                router.push(
                  `/auth/verify-code?email=${encodeURIComponent(userEmail)}`
                )
              }
              className="w-full"
            >
              Enter Verification Code
            </Button>
          </div>
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
}
