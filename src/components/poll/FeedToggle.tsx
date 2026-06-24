"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FeedToggle({
  currentFeed,
}: {
  currentFeed: "for_you" | "following";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const changeFeed = (feed: "for_you" | "following") => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("feed", feed);
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex justify-end mb-2">
      <Tabs
        value={currentFeed}
        onValueChange={(value) =>
          changeFeed(value as "for_you" | "following")
        }
      >
        <TabsList 
        className="bg-zinc-200 p-1 rounded-full"
        >
          <TabsTrigger value="for_you" 
          className="rounded-full px-4 py-2 cursor-pointer active:scale-[0.99]"
          >
            For You
          </TabsTrigger>

          <TabsTrigger value="following" 
          className="rounded-full px-4 py-2 cursor-pointer active:scale-[0.99]"
          >
            Following
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}