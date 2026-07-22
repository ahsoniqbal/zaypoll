"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ArrowLeftIcon } from "lucide-react";

export default function BackButton() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (

        <Button onClick={handleBack} variant="ghost" aria-label="Go back">
            <ArrowLeftIcon /> Back
        </Button>
    );
}
