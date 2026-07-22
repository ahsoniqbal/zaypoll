"use client";

import { updateAgeGroupAction } from "@/actions/user.actions";
import type { AgeGroup } from "@/types/user.types";
import { useState, useTransition } from "react";

const choices: Array<{ value: AgeGroup; label: string }> = [
  { value: "under_18", label: "Under 18" }, { value: "18_24", label: "18–24" },
  { value: "25_34", label: "25–34" }, { value: "35_44", label: "35–44" },
  { value: "45_54", label: "45–54" }, { value: "55_plus", label: "55+" },
];

export default function AgeGroupSelector({ initialValue }: { initialValue: AgeGroup | null }) {
  const [value, setValue] = useState(initialValue ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  return <div className="mt-4 border-t pt-4"><label htmlFor="age-group" className="block text-xs font-medium">Optional age range</label><div className="mt-1 flex flex-wrap items-center gap-2"><select id="age-group" value={value} disabled={isPending} onChange={(event) => { const next = event.target.value as AgeGroup | ""; setValue(next); startTransition(async () => { const result = await updateAgeGroupAction(next || null); setMessage(result.message); }); }} className="rounded-lg border bg-background px-3 py-1.5 text-sm"><option value="">Prefer not to say</option>{choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select>{message && <span className="text-xs text-muted-foreground" role="status">{message}</span>}</div><p className="mt-1 text-xs text-muted-foreground">Used only in aggregated analytics and hidden for small samples.</p></div>;
}
