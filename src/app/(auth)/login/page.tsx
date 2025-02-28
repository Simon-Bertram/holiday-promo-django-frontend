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
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"password" | "magic">(
    "password"
  );
  const [magicCodeRequested, setMagicCodeRequested] = useState(false);
  const { setUser, setIsAuthenticated } = useAuthStore();

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
    setIsLoading(true);
    try {
      const user = await login(values);
      setUser(user);
      setIsAuthenticated(true);
      toast.success("Login successful");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle magic code request
  const onMagicCodeSubmit = async (values: z.infer<typeof magicCodeSchema>) => {
    setIsLoading(true);
    try {
      await requestMagicCode(values);
      setMagicCodeRequested(true);
      toast.success("Magic code sent to your email");
    } catch (error: any) {
      toast.error(error.response?.data?.email || "Failed to send magic code");
    } finally {
      setIsLoading(false);
    }
  };

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
                  We've sent a magic code to your email. Please check your inbox
                  and enter the code on the verification page.
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
          Don't have an account?{" "}
          <Link href="/auth/register" className="underline">
            Register
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
