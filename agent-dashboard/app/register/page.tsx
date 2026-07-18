"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Building2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { RegistrationRequest } from "@/lib/types";
import { useForm, SubmitHandler } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { registerUser, clearError, setLoading } from "@/lib/store/auth-slice";

export default function RegisterPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit } = useForm<RegistrationRequest>();

    useEffect(() => {
        dispatch(clearError());
        dispatch(setLoading(false));
    }, [dispatch]);

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    const onSubmit: SubmitHandler<RegistrationRequest> = async (data) => {
        dispatch(registerUser(data));
    }


    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <Building2 className="h-7 w-7" />
                    </div>

                    <div>
                        <CardTitle className="text-2xl font-bold">
                            Create Organization
                        </CardTitle>

                        <CardDescription className="mt-2">
                            Create your organization and start managing customer
                            conversations.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="organization">
                                Organization Name
                            </Label>

                            <Input
                                id="organization"
                                type="text"
                                placeholder="Acme Inc."
                                required
                                {...register("organizationName")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@acme.com"
                                required
                                {...register("email")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password
                            </Label>

                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a secure password"
                                    className="pr-10"
                                    required
                                    {...register("password")}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <Alert
                                variant="destructive"
                                className="animate-in fade-in slide-in-from-top-2 duration-300"
                            >
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="font-medium">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-primary hover:underline"
                            >
                                Sign In
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}