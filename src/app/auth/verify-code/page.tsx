"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

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
import { verifyMagicCode } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/auth/store";

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
      const user = await verifyMagicCode(values);

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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to verify code";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Verify Code</CardTitle>
        <CardDescription>
          Enter the 5-digit verification code sent to your email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the 5-digit code"
                      maxLength={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center">
          {"Didn't receive a code? "}
          <Link href="/auth/login" className="underline">
            Try again
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
