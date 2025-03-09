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
import { register } from "@/features/auth/hooks/use-auth";

// Form validation schema for registration
const registerSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    password_confirm: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords don't match",
    path: ["password_confirm"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Registration form
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      password_confirm: "",
      first_name: "",
      last_name: "",
    },
  });

  // Handle registration
  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    try {
      await register(values);
      toast.success("Registration successful! Please log in.");
      router.push("/auth/login");
    } catch (error: unknown) {
      console.error("Registration error:", error);

      // Define a type for our custom error structure
      type CustomError = Error & {
        fieldErrors?: Record<string, string[]>;
      };

      const err = error as CustomError;

      // Check if the error has fieldErrors property (our custom format)
      if (err.fieldErrors) {
        // Process field errors
        Object.entries(err.fieldErrors).forEach(([field, messages]) => {
          // Only process fields that are in our form
          if (
            [
              "email",
              "password",
              "password_confirm",
              "first_name",
              "last_name",
            ].includes(field)
          ) {
            // Format field name for display
            const formattedField = field
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            // Ensure messages is an array
            const messageArray = Array.isArray(messages)
              ? messages
              : [String(messages)];

            // Set error in the form
            const formField = field as keyof z.infer<typeof registerSchema>;
            form.setError(formField, {
              type: "server",
              message: messageArray[0],
            });

            // Show toast for the error
            messageArray.forEach((message) => {
              toast.error(`${formattedField}: ${message}`, {
                description: "Please try a different value",
                duration: 5000,
              });
            });
          }
        });
      } else {
        // Handle generic error
        const errorMessage = err.message || "Registration failed";
        toast.error("Registration failed", {
          description: errorMessage,
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Register</CardTitle>
        <CardDescription>Create a new account</CardDescription>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password_confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline">
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
