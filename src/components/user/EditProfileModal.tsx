"use client";

import { Button } from "@/components/ui/button";
import { useProfileCompletionDialog } from "@/components/profile/ProfileCompletionProvider";

export default function EditProfileModal() {
  const dialog = useProfileCompletionDialog();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => dialog?.openDialog("edit")}
      disabled={!dialog}
    >
      Edit profile
    </Button>
  );
}
