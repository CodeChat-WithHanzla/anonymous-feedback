"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { signInSchema } from "@/schemas/signInSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

type Inputs = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<Inputs>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: ""
    }
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);

    const res = await signIn("credentials", {
      redirect: false,
      username: data.identifier,
      password: data.password
    });

    setIsSubmitting(false);

    if (res?.ok) {
      toast.success("Sign-in successful!");
      router.push("/");
    } else {
      toast.error(res?.error || "Sign-in failed. Please try again.");
      console.log("SignIn error:", res);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
          <p className="mb-4">Sign in to start your anonymous adventure.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your@email.com or username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="*********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
}
