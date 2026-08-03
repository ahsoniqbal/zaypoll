"use client";

import Image from "next/image";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { useState } from "react";

import FollowButton from "@/components/FollowButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitials } from "@/lib/utils";
import type { PopularAccount } from "@/types/user.types";

type Props = {
  initialAccounts: PopularAccount[];
  isLoggedIn: boolean;
};

function AccountRow({
  account,
  isLoggedIn,
  onFollow,
  inModal = false,
}: {
  account: PopularAccount;
  isLoggedIn: boolean;
  onFollow: (accountId: number) => void;
  inModal?: boolean;
}) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 px-2 ${inModal ? "py-2" : "py-1.5"}`}>
      <Link
        href={`/user/${encodeURIComponent(account.userName)}`}
        aria-label={`View ${account.name}'s profile`}
        className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
          {account.image ? (
            <Image src={account.image} alt="" fill sizes="36px" className="object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-xs font-medium text-muted-foreground">
              {getInitials(account.name, account.userName)}
            </span>
          )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/user/${encodeURIComponent(account.userName)}`}
          className="block truncate text-sm font-semibold text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {account.name}
        </Link>
        {/* <p className="truncate text-xs text-muted-foreground">@{account.userName}</p> */}
        {inModal && (
          <p className="text-[11px] text-muted-foreground">
            {account.followersCount.toLocaleString()} {account.followersCount === 1 ? "follower" : "followers"}
          </p>
        )}
      </div>
      <FollowButton
        userId={account.id}
        initialIsFollowing={false}
        isLoggedIn={isLoggedIn}
        compact
        onFollowChange={(isFollowing) => {
          if (isFollowing) onFollow(account.id);
        }}
      />
    </div>
  );
}

export default function PopularAccountsCard({ initialAccounts, isLoggedIn }: Props) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const visibleAccounts = accounts.slice(0, 5);

  if (visibleAccounts.length === 0) return null;

  const removeFollowedAccount = (accountId: number) => {
    setAccounts((current) => current.filter((account) => account.id !== accountId));
  };

  return (
    <Dialog.Root>
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-3 py-2.5">
          <CardTitle className="text-sm font-semibold">Popular accounts</CardTitle>
        </CardHeader>
        <CardContent className="p-1.5">
          <div>
            {visibleAccounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                isLoggedIn={isLoggedIn}
                onFollow={removeFollowedAccount}
              />
            ))}
          </div>

          {accounts.length > 5 && (
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="mt-0.5 w-full rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                See more
              </button>
            </Dialog.Trigger>
          )}
        </CardContent>
      </Card>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-foreground/10 focus:outline-none">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <Dialog.Title className="text-base font-semibold">Popular accounts</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close popular accounts"
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>
          <ScrollArea className="h-[min(65vh,32rem)]">
            <div className="divide-y px-4 py-2">
              {accounts.map((account) => (
                <AccountRow
                  key={account.id}
                  account={account}
                  isLoggedIn={isLoggedIn}
                  onFollow={removeFollowedAccount}
                  inModal
                />
              ))}
            </div>
          </ScrollArea>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
