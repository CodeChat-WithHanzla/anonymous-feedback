"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { useDebounceCallback } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signupSchema";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
type Inputs = {
  username: string;
  email: string;
  password: string;
};

export default function Page() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounced = useDebounceCallback(setUsername, 1000);
  const router = useRouter();
  // zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: ""
    }
  });
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const res = await axios.get(
            `/api/check-username-unique?username=${username}`
          );
          setUsernameMessage(res.data.message);
        } catch (error) {
          const axiosError = error as AxiosError;
          const message =
            axiosError.response?.data?.message ||
            "Sign-up failed. Please try again or check your network connection.";
          toast.error(message);
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  const onSubmit: SubmitHandler<Inputs> = async (
    data: z.infer<typeof signUpSchema>
  ) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/sign-up", data);
      toast.success(
        "Sign-up successful! Please verify your account to continue."
      );
      router.replace(`/api/verify-code/${username}`);
      setIsSubmitting(false);
    } catch (error) {
      toast.error(
        "Sign-up failed. Please try again or check your network connection."
      );
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  {usernameMessage && (
                    <p
                      className={`text-sm ${usernameMessage === "Username is available." ? "text-green-700" : "text-red-700"}`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@gmail.com" {...field} />
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
          </form>
        </Form>
      </div>
    </div>
  );
}
