"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";

interface CaptchaVerificationProps {
  onCaptchaChange: (token: string | null) => void;
  isLoading: boolean;
}

export function CaptchaVerification({
  onCaptchaChange,
  isLoading,
}: CaptchaVerificationProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  return (
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
      {isLoading && <p className="text-sm text-center mt-2">Processing...</p>}
    </div>
  );
}

interface MagicCodeSentProps {
  email: string;
}

export function MagicCodeSent({ email }: MagicCodeSentProps) {
  const router = useRouter();

  return (
    <div className="text-center space-y-4">
      <p>
        We&apos;ve sent a 5-digit verification code to your email. Please check
        your inbox and enter the code on the verification page.
      </p>
      <Button
        onClick={() =>
          router.push(`/auth/verify-code?email=${encodeURIComponent(email)}`)
        }
        className="w-full"
      >
        Enter Verification Code
      </Button>
    </div>
  );
}
