// @app/components/features/bills/BillPanelBackClient.jsx

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BillPanelBackClient({ children = "Legislation" }) {
    const router = useRouter();

    return (
        <button type="button" className="llbp-breadcrumb__back" onClick={() => router.back()}>
            <ArrowLeft size={14} aria-hidden="true" />
            {children}
        </button>
    );
}