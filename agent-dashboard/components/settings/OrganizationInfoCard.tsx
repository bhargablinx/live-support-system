"use client";

import { useState } from "react";
import { Check, Copy, Pencil } from "lucide-react";

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

export function OrganizationInfoCard() {
    const organization = {
        id: "org_8F3K29H1LQ",
        name: "Acme Technologies",
        totalAgents: 12,
    };

    const [name, setName] = useState(organization.name);
    const [editing, setEditing] = useState(false);
    const [copied, setCopied] = useState(false);

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
    }

    function handleSave() {
        // API call later
        setEditing(false);
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
                            disabled={!editing}
                            onChange={(e) => setName(e.target.value)}
                        />

                        {!editing && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditing(true)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {editing && (
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>

                            <Button
                                disabled={!hasChanged}
                                onClick={handleSave}
                            >
                                Save Changes
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