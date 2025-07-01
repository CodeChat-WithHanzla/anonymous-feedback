"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { verifyCodeSchema } from "@/schemas/verifyCodeSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import * as z from "zod";

type Inputs = {
  code: string;
};
export default function Page() {
  const router = useRouter();
  const { username } = useParams<{ username: string }>();
  const form = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema)
  });
  const onSubmit: SubmitHandler<Inputs> = async (
    data: z.infer<typeof verifyCodeSchema>
  ) => {
    try {
      await axios.post("/api/verify-code", {
        username,
        code: data.code
      });
      toast.success("Account verified.");
    } catch (error) {
      const axiosError = error as AxiosError;
      const message =
        axiosError.response?.data?.message ||
        "Verification failed. Please try again.";
      toast.error(message);
    } finally {
      router.replace("/");
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify your Account.
          </h1>
          <p className="mb-4">
            Enter the Verification code sent to your email.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
