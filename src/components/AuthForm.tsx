import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser, registerUser } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const authFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type AuthFormValues = z.infer<typeof authFormSchema>;

export default function AuthForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("login");
  
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AuthFormValues) => {
    setIsLoading(true);
    
    try {
      if (activeTab === "login") {
        await loginUser(data.email, data.password);
      } else {
        await registerUser(data.email, data.password);
      }
      navigate("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Welcome to SkinSense ML</CardTitle>
        <CardDescription className="text-center">
          {activeTab === "login" 
            ? "Sign in to access the skin disease detection system" 
            : "Create an account to get started"}
        </CardDescription>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 mx-4">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
      </Tabs>
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
                    <Input placeholder="you@example.com" {...field} />
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
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : activeTab === "login" ? "Login" : "Register"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-sm text-center text-muted-foreground flex justify-center">
        <div>
          {activeTab === "login" ? "Don't have an account?" : "Already have an account?"}
          <Button 
            variant="link" 
            onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
            className="p-0 h-auto ml-1"
          >
            {activeTab === "login" ? "Register" : "Login"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
