"use client";

import { useState } from "react";
import { Loader2, UserCheck } from "lucide-react";
import { useAppDispatch } from "@/lib/store/store";
import { updateUserName } from "@/lib/store/auth-slice";
import { updateProfile } from "@/lib/api/agent";
import { User } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSettingsCardProps {
    user: User;
}

export function ProfileSettingsCard({ user }: ProfileSettingsCardProps) {
    const dispatch = useAppDispatch();
    const [name, setName] = useState(user.name || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const hasChanged = (name.trim() || "") !== (user.name || "");

    async function handleSave() {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await updateProfile(name.trim());
            dispatch(updateUserName(res.data.user.name || null));
            setSuccess("Profile display name updated successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                "Failed to update profile name.";
            setError(msg);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Agent Profile Settings
                </CardTitle>
                <CardDescription>
                    Update your display name shown in chats, assignments, and agent directory.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Email (Read-only) */}
                <div className="space-y-2">
                    <Label htmlFor="profile-email">Email Address</Label>
                    <Input id="profile-email" value={user.email} disabled className="bg-muted/50" />
                </div>

                {/* Role (Read-only) */}
                <div className="space-y-2">
                    <Label htmlFor="profile-role">Role</Label>
                    <Input id="profile-role" value={user.role} disabled className="bg-muted/50 font-semibold" />
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                    <Label htmlFor="profile-name">Display Name</Label>
                    <div className="flex gap-3">
                        <Input
                            id="profile-name"
                            placeholder="e.g. John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={saving}
                        />
                        <Button
                            disabled={!hasChanged || saving}
                            onClick={handleSave}
                            type="button"
                            className="shrink-0"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Display Name"
                            )}
                        </Button>
                    </div>

                    {error && (
                        <p className="text-sm font-medium text-destructive mt-1">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                            {success}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
