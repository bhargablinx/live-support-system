"use client";

import { useState } from "react";
import { Check, Copy, Pencil, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/lib/store/store";
import { updateOrgName } from "@/lib/store/auth-slice";
import { updateOrganizationName } from "@/lib/api/org";
import { OrganizationDetails } from "@/lib/types";

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

interface OrganizationInfoCardProps {
    organization: OrganizationDetails;
    isAdmin: boolean;
    onNameUpdate: (newName: string) => void;
}

export function OrganizationInfoCard({ organization, isAdmin, onNameUpdate }: OrganizationInfoCardProps) {
    const dispatch = useAppDispatch();
    const [name, setName] = useState(organization.name);
    const [editing, setEditing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasChanged = name.trim() !== organization.name;

    async function handleCopy() {
        await navigator.clipboard.writeText(organization.id);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    function handleCancel() {
        setName(organization.name);
        setEditing(false);
        setError(null);
    }

    async function handleSave() {
        if (!name.trim()) return;
        setSaving(true);
        setError(null);
        try {
            const res = await updateOrganizationName(name);
            dispatch(updateOrgName(res.data.name));
            onNameUpdate(res.data.name);
            setEditing(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to update organization name");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>
                    View and update your organization details.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* Organization ID */}
                <div className="space-y-2">
                    <Label>Organization ID</Label>

                    <div className="flex items-center gap-3">
                        <Input
                            value={organization.id}
                            disabled
                            className="font-mono"
                        />

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopy}
                            type="button"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Organization Name */}
                <div className="space-y-2">
                    <Label>Organization Name</Label>

                    <div className="flex gap-3">
                        <Input
                            value={name}
                            disabled={!editing || saving}
                            onChange={(e) => setName(e.target.value)}
                        />

                        {!editing && isAdmin && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditing(true)}
                                type="button"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {error && (
                        <p className="text-sm font-medium text-destructive mt-1">
                            {error}
                        </p>
                    )}

                    {editing && (
                        <div className="flex justify-end gap-2 mt-2">
                            <Button
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={saving}
                                type="button"
                            >
                                Cancel
                            </Button>

                            <Button
                                disabled={!hasChanged || saving}
                                onClick={handleSave}
                                type="button"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Total Agents */}
                <div className="space-y-2">
                    <Label>Total Agents</Label>

                    <Input
                        value={`${organization.totalAgents} registered agents`}
                        disabled
                    />
                </div>
            </CardContent>
        </Card>
    );
}