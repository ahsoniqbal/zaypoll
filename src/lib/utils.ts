import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name?: string | null, username?: string | null) {
    const source = name?.trim() || username?.trim() || "User";
    const parts = source.split(/[\s._-]+/).filter(Boolean);

    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return parts[0].slice(0, 2).toUpperCase();
}

const compactNumberFormatter = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
});

export function formatCompactNumber(value: number) {
    return compactNumberFormatter.format(value);
}

