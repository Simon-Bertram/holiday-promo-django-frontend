"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/auth-store-provider";
import { VerifyCodeForm } from "./verify-code-form";

// Form validation schema for magic code verification
const verifyCodeSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  code: z.string().regex(/^\d{5}$/, { message: "Magic code must be 5 digits" }),
});

export default function VerifyCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Get auth store functions in a single selector to prevent multiple subscriptions
  const { loginWithMagicCode } = useAuthStore((state) => ({
    loginWithMagicCode: state.loginWithMagicCode,
  }));

  // Get email from URL params if available
  const emailFromParams = searchParams.get("email");

  // Magic code verification form
  const form = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      email: emailFromParams || "",
      code: "",
    },
  });

  // Update form values when URL params change
  useEffect(() => {
    if (emailFromParams) {
      form.setValue("email", emailFromParams);
    }
  }, [emailFromParams, form]);

  // Handle magic code verification
  const onSubmit = async (values: z.infer<typeof verifyCodeSchema>) => {
    setIsLoading(true);
    try {
      // loginWithMagicCode already updates the store state internally
      const user = await loginWithMagicCode(values);

      // Check if the user object exists
      if (user) {
        toast.success("Login successful");

        // Redirect based on user role
        if (user.role === "ADMIN" || user.role === "MODERATOR") {
          router.push("/dashboard");
        } else {
          router.push("/profile");
        }
      } else {
        // Handle case where user data is missing
        console.error("Invalid response format: missing user data");
        toast.error("Unexpected response format. Please try again.");
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("timeout")) {
        toast.error(
          "Request timed out. The server took too long to respond. Please try again."
        );
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to verify code";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VerifyCodeForm form={form} onSubmit={onSubmit} isLoading={isLoading} />
  );
}
