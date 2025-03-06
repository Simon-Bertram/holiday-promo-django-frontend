// VerifyCodeForm.tsx
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

// Define the schema type (or import it from a shared location)
const verifyCodeSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  code: z.string().regex(/^\d{5}$/, { message: "Magic code must be 5 digits" }),
});

interface VerifyCodeFormProps {
  form: UseFormReturn<z.infer<typeof verifyCodeSchema>>;
  onSubmit: (data: z.infer<typeof verifyCodeSchema>) => void;
  isLoading: boolean;
}

export function VerifyCodeForm({
  form,
  onSubmit,
  isLoading,
}: VerifyCodeFormProps) {
  return (
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
  );
}
