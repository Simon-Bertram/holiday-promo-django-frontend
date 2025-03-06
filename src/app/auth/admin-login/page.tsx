"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { adminLogin } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/auth/store";

// Password validation schema
const passwordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setIsAuthenticated } = useAuthStore();

  // Initialize form with zod resolver
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: PasswordFormValues) => {
    if (!email) {
      toast.error("Email is missing. Please restart the login process.");
      router.push("/auth/login");
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to verify admin password
      const response = await adminLogin({
        email: email || "",
        password: values.password,
      });

      console.log("Full API response:", response);

      // Check if response and response.user exist
      if (!response || !response.user) {
        console.error("Invalid response structure:", response);
        toast.error("Received invalid response from server");
        return;
      }

      const user = response.user;
      console.log("User object:", user);

      // Verify user has required properties
      if (!user.email) {
        console.error("User object missing email:", user);
        toast.error("User data is incomplete");
        return;
      }

      // Set user in auth store
      setUser(user);
      setIsAuthenticated(true);

      // Show success message
      toast.success("Authentication successful");

      // Redirect to admin dashboard or appropriate page
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Admin Authentication
          </CardTitle>
          <CardDescription>
            Please enter your password to complete the authentication process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Authenticate"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
