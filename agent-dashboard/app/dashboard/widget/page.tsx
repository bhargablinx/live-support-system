"use client";

import { Wrench, ArrowLeft } from "lucide-react";
import Link from "next/link";

function WidgetPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="max-w-lg text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border bg-muted">
                    <Wrench className="h-10 w-10 text-primary" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight">
                    Under Construction
                </h1>

                <p className="mt-4 text-muted-foreground">
                    We're still building this feature. It will be available
                    soon with a better experience.
                </p>

                <div className="mt-8 rounded-xl border bg-card p-6 text-left">
                    <h2 className="font-semibold">What's happening?</h2>

                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <li>• UI is currently being developed.</li>
                        <li>• Backend integration is in progress.</li>
                        <li>• More functionality will be added soon.</li>
                    </ul>
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default WidgetPage;