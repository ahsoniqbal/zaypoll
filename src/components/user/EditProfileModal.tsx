"use client";

import { useEffect, useState, useTransition } from "react";
import { ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { updateProfileAction } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AgeGroup } from "@/types/user.types";

type Props = {
  initialName: string;
  initialAgeGroup: AgeGroup | null;
};

const ageGroupChoices: Array<{ value: AgeGroup; label: string }> = [
  { value: "under_18", label: "Under 18" },
  { value: "18_24", label: "18–24" },
  { value: "25_34", label: "25–34" },
  { value: "35_44", label: "35–44" },
  { value: "45_54", label: "45–54" },
  { value: "55_plus", label: "55+" },
];

export default function EditProfileModal({
  initialName,
  initialAgeGroup,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialName);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | "">(initialAgeGroup ?? "");

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const closeModal = () => {
    if (isPending) return;
    setName(initialName);
    setAgeGroup(initialAgeGroup ?? "");
    setIsOpen(false);
  };

  const submitProfile = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfileAction(formData);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
        Edit profile
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            className="relative w-full max-w-md rounded-t-2xl bg-card p-6 shadow-xl ring-1 ring-foreground/10 sm:rounded-2xl"
          >
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              aria-label="Close edit profile dialog"
              className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 id="edit-profile-title" className="text-xl font-semibold tracking-tight">
              Edit profile
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep your personal details accurate and up to date.
            </p>

            <form action={submitProfile} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label htmlFor="profile-name" className="text-sm font-medium">
                  Display name
                </label>
                <Input
                  id="profile-name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your display name is visible to other Zaypoll users.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="profile-age-group" className="text-sm font-medium">
                  Age range <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <select
                  id="profile-age-group"
                  name="ageGroup"
                  value={ageGroup}
                  onChange={(event) => setAgeGroup(event.target.value as AgeGroup | "")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Prefer not to say</option>
                  {ageGroupChoices.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Used only for aggregated insights and never shown on your public profile.
                </p>
              </div>

              <div className="flex gap-3 rounded-xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-foreground" aria-hidden="true" />
                <p>
                  Your privacy matters. Your age range is kept private and is never shown on your
                  public profile. We do not sell your personal information or share it with other
                  users.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <Button type="button" variant="ghost" onClick={closeModal} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || name.trim().length < 2}>
                  {isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
