"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { login, requestMagicCode } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/auth/store";
import { useAsyncOperation, useFormError } from "@/lib/error";

// Form validation schema for password login
const passwordLoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Form validation schema for magic code request
const magicCodeSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function LoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"password" | "magic">(
    "password"
  );
  const [magicCodeRequested, setMagicCodeRequested] = useState(false);
  const { setUser, setIsAuthenticated } = useAuthStore();
  const { handleError } = useFormError();

  // Use our custom hook for login operation
  const { execute: executeLogin, isLoading: isLoginLoading } =
    useAsyncOperation(login, {
      onSuccess: (user) => {
        setUser(user);
        setIsAuthenticated(true);
        toast.success("Login successful");
        router.push("/dashboard");
      },
    });

  // Use our custom hook for magic code request
  const { execute: executeMagicCode, isLoading: isMagicCodeLoading } =
    useAsyncOperation(requestMagicCode, {
      onSuccess: () => {
        setMagicCodeRequested(true);
        toast.success("Magic code sent to your email");
      },
    });

  // Password login form
  const passwordForm = useForm<z.infer<typeof passwordLoginSchema>>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Magic code form
  const magicForm = useForm<z.infer<typeof magicCodeSchema>>({
    resolver: zodResolver(magicCodeSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle password login
  const onPasswordSubmit = async (
    values: z.infer<typeof passwordLoginSchema>
  ) => {
    try {
      await executeLogin(values);
    } catch (error) {
      // Error is already handled by the useAsyncOperation hook
      handleError(error);
    }
  };

  // Handle magic code request
  const onMagicCodeSubmit = async (values: z.infer<typeof magicCodeSchema>) => {
    try {
      await executeMagicCode(values);
    } catch (error) {
      // Error is already handled by the useAsyncOperation hook
      handleError(error);
    }
  };

  // Determine if any operation is loading
  const isLoading = isLoginLoading || isMagicCodeLoading;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Choose your preferred login method</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-6">
          <Button
            variant={authMethod === "password" ? "default" : "outline"}
            onClick={() => setAuthMethod("password")}
            className="flex-1"
          >
            Password
          </Button>
          <Button
            variant={authMethod === "magic" ? "default" : "outline"}
            onClick={() => {
              setAuthMethod("magic");
              setMagicCodeRequested(false);
            }}
            className="flex-1"
          >
            Magic Code
          </Button>
        </div>

        {authMethod === "password" ? (
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
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
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        ) : (
          <>
            {!magicCodeRequested ? (
              <Form {...magicForm}>
                <form
                  onSubmit={magicForm.handleSubmit(onMagicCodeSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={magicForm.control}
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
                    {isLoading ? "Sending..." : "Send Magic Code"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center space-y-4">
                <p>
                  We&apos;ve sent a magic code to your email. Please check your
                  inbox and enter the code on the verification page.
                </p>
                <Button
                  onClick={() => router.push("/auth/verify-code")}
                  className="w-full"
                >
                  Enter Magic Code
                </Button>
              </div>
            )}
          </>
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
