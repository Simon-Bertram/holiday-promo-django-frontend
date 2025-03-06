"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth/store";
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
  const { setUser, setIsAuthenticated } = useAuthStore();
  const { loginWithMagicCode } = useAuthStore();

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
      const user = await loginWithMagicCode(values);

      // Check if the user object exists
      if (user) {
        // For regular users, complete authentication and redirect to profile
        if (user.role === "USER") {
          setUser(user);
          setIsAuthenticated(true);
          toast.success("Login successful");
          router.push("/profile");
        }
        // For admin/moderator users, redirect to password verification
        else if (user.role === "ADMIN" || user.role === "MODERATOR") {
          toast.success(
            "Code verified successfully. Please enter your password to complete login"
          );
          router.push(
            `/auth/admin-login?email=${encodeURIComponent(values.email)}`
          );
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
