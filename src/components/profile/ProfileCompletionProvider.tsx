"use client";

import { createContext, useCallback, useContext, useEffect, useState, useTransition } from "react";
import { ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  dismissProfileOnboardingAction,
  updateProfileAction,
} from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AgeGroup, Gender, ProfileCompletion } from "@/types/user.types";

type DialogMode = "onboarding" | "edit";
type ProfileDialogContextValue = {
  isComplete: boolean;
  openDialog: (mode?: DialogMode) => void;
};

const ProfileDialogContext = createContext<ProfileDialogContextValue | null>(null);

export function useProfileCompletionDialog() {
  return useContext(ProfileDialogContext);
}

export default function ProfileCompletionProvider({
  profile,
  children,
}: {
  profile: ProfileCompletion | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<DialogMode>("onboarding");
  const [isOpen, setIsOpen] = useState(Boolean(profile && !profile.hasBeenPrompted));
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(profile?.name ?? "");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | "">(profile?.ageGroup ?? "");
  const [gender, setGender] = useState<Gender | "">(profile?.gender ?? "");

  const resetFields = useCallback(() => {
    setName(profile?.name ?? "");
    setAgeGroup(profile?.ageGroup ?? "");
    setGender(profile?.gender ?? "");
  }, [profile]);

  const openDialog = useCallback((nextMode: DialogMode = "edit") => {
    if (!profile) return;
    resetFields();
    setMode(nextMode);
    setIsOpen(true);
  }, [profile, resetFields]);

  const close = useCallback(() => {
    if (isPending) return;

    if (mode === "edit") {
      resetFields();
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      const result = await dismissProfileOnboardingAction();
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      // No refresh is needed: the incomplete-profile card remains visible and
      // local state already closes the one-time automatic prompt.
      setIsOpen(false);
    });
  }, [isPending, mode, resetFields]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [close, isOpen]);

  const save = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setIsOpen(false);
      // Saving can change the public name and profile-completion card, both of
      // which are server-rendered. This is the only dialog path that refreshes.
      router.refresh();
    });
  };

  const isOnboarding = mode === "onboarding";

  return (
    <ProfileDialogContext.Provider
      value={profile ? { isComplete: profile.isComplete, openDialog } : null}
    >
      {children}
      {profile && isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-dialog-title"
            aria-describedby="profile-dialog-description"
            className="relative w-full max-w-lg rounded-t-2xl bg-card p-6 shadow-xl ring-1 ring-foreground/10 sm:rounded-2xl"
          >
            <button
              type="button"
              onClick={close}
              disabled={isPending}
              aria-label={isOnboarding ? "Skip profile completion" : "Close profile dialog"}
              className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <X className="size-4" />
            </button>

            <h2 id="profile-dialog-title" className="pr-8 text-xl font-semibold tracking-tight">
              {isOnboarding ? "Help us personalize your experience" : "Edit profile"}
            </h2>
            <p id="profile-dialog-description" className="mt-2 text-sm leading-6 text-muted-foreground">
              {isOnboarding
                ? "Your age group and gender are private and won’t appear on your public profile. We use this information to recommend more relevant polls and provide better aggregated poll insights."
                : "Update your public name and private personalization details."}
            </p>

            <form action={save} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="profile-dialog-name" className="text-sm font-medium">Name</label>
                <Input
                  id="profile-dialog-name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
                <p className="text-xs font-medium text-foreground">
                  Your name remains publicly visible on your profile and polls.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="profile-dialog-age" className="text-sm font-medium">Age group</label>
                  <select
                    id="profile-dialog-age"
                    name="ageGroup"
                    value={ageGroup}
                    onChange={(event) => setAgeGroup(event.target.value as AgeGroup | "")}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Select an age group</option>
                    <option value="under_18">Under 18</option>
                    <option value="18_24">18–24</option>
                    <option value="25_34">25–34</option>
                    <option value="35_44">35–44</option>
                    <option value="45_54">45–54</option>
                    <option value="55_plus">55+</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="profile-dialog-gender" className="text-sm font-medium">Gender</label>
                  <select
                    id="profile-dialog-gender"
                    name="gender"
                    value={gender}
                    onChange={(event) => setGender(event.target.value as Gender | "")}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Select an option</option>
                    <option value="woman">Woman</option>
                    <option value="man">Man</option>
                    <option value="non_binary">Non-binary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 rounded-xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-foreground" />
                <p>Age group and gender stay private and are used for recommendations and aggregated insights.</p>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <Button type="button" variant="ghost" onClick={close} disabled={isPending}>
                  {isOnboarding ? "Skip for now" : "Cancel"}
                </Button>
                <Button type="submit" disabled={isPending || name.trim().length < 2 || !ageGroup || !gender}>
                  {isPending ? "Saving..." : isOnboarding ? "Save profile" : "Save changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProfileDialogContext.Provider>
  );
}
