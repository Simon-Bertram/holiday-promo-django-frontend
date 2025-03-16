import { useState } from "react";
import { toast } from "sonner";
import { useAsyncOperation, useFormError } from "@/shared/lib/error";
import { authService } from "./use-auth";
import { EmailFormValues } from "../components/login-form";

// Authentication flow stages
export enum LoginStage {
  EMAIL_ENTRY, // Step 1: Enter email
  CAPTCHA_VERIFICATION, // Step 2: Complete CAPTCHA
  MAGIC_CODE_SENT, // Step 3: Magic code sent, await verification
}

export function useLoginFlow() {
  const { handleError } = useFormError();
  const { requestMagicCode } = authService;

  const [stage, setStage] = useState<LoginStage>(LoginStage.EMAIL_ENTRY);
  const [userEmail, setUserEmail] = useState<string>("");

  // Check if user exists and send magic code
  const { execute: executeRequestMagicCode, isLoading: isMagicCodeLoading } =
    useAsyncOperation(requestMagicCode, {
      onSuccess: () => {
        setStage(LoginStage.MAGIC_CODE_SENT);
        toast.success(
          "If your email exists in our system, a magic code has been sent to it"
        );
      },
    });

  // Handle email submission
  const handleEmailSubmit = async (values: EmailFormValues) => {
    setUserEmail(values.email);
    setStage(LoginStage.CAPTCHA_VERIFICATION);
  };

  // Handle CAPTCHA verification
  const handleCaptchaChange = async (token: string | null) => {
    if (token) {
      try {
        // After CAPTCHA verification, check if user exists and send magic code
        await executeRequestMagicCode({
          email: userEmail,
          captcha_token: token,
        });
      } catch (error) {
        // For security, don't reveal if email doesn't exist
        setStage(LoginStage.MAGIC_CODE_SENT);
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

  return {
    stage,
    userEmail,
    isLoading: isMagicCodeLoading,
    handleEmailSubmit,
    handleCaptchaChange,
  };
}
