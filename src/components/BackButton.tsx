"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

export default function BackButton() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (

        <Button onClick={handleBack} className="cursor-pointer" variant="secondary" aria-label="Submit">
            <ArrowLeftIcon /> Back
        </Button>
    );
}