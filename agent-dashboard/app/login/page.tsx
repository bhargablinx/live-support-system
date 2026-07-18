"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, Headset } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useForm, SubmitHandler } from "react-hook-form";
import type { LoginRequest } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { loginUser, clearError } from "@/lib/store/auth-slice";

export default function LoginPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit } = useForm<LoginRequest>();

    useEffect(() => {
        // Clear any leftover errors when component mounts
        dispatch(clearError());
    }, [dispatch]);

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    const onSubmit: SubmitHandler<LoginRequest> = async (data) => {
        dispatch(loginUser(data));
    }


    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <Headset className="h-7 w-7" />
                    </div>

                    <div>
                        <CardTitle className="text-2xl font-bold">
                            Agent Login
                        </CardTitle>

                        <CardDescription className="mt-2">
                            Sign in to access your support dashboard.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="agent@company.com"
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
                                    placeholder="••••••••"
                                    required
                                    className="pr-10"
                                    {...register("password")}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
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

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Checkbox id="remember" />

                                <Label
                                    htmlFor="remember"
                                    className="font-normal"
                                >
                                    Remember me
                                </Label>
                            </div>

                            <Link
                                href="/forgot-password"
                                className="text-primary hover:underline"
                            >
                                Forgot password?
                            </Link>
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
                            className="w-full"
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}