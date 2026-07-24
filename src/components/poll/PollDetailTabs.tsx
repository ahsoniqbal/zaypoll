"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalyticsTab, PollAnalytics } from "@/types/poll-analytics.types";
import type { CommentDto, PollOptionDto } from "@/dto/poll.dtos";
import ReasonSection from "./ReasonSection";
import PollAnalyticsTab from "./PollAnalyticsTab";

type Props = {
  initialTab: AnalyticsTab;
  analytics: PollAnalytics;
  pollId: number;
  options: PollOptionDto[];
  isUserLoggedIn: boolean;
  hasVoted: boolean;
  userVoteOptionId: number | null;
  hasReason: boolean;
  initialReasons: CommentDto[];
  onReasonAdded: () => void;
  canRefreshInsights: boolean;
};

function tabFromUrl(): AnalyticsTab {
  return new URLSearchParams(window.location.search).get("tab") === "analytics" ? "analytics" : "reasons";
}

export default function PollDetailTabs(props: Props) {
  const [tab, setTab] = useState<AnalyticsTab>(props.initialTab);
  useEffect(() => {
    const onPopState = () => setTab(tabFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const changeTab = (value: string) => {
    const next: AnalyticsTab = value === "analytics" ? "analytics" : "reasons";
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "reasons") url.searchParams.delete("tab"); else url.searchParams.set("tab", next);
    window.history.pushState({}, "", url);
  };
  return <Tabs value={tab} onValueChange={changeTab} className="mt-5">
    <TabsList variant="line" className="sticky top-14 z-10 w-full justify-start border-b bg-card/95 backdrop-blur sm:static sm:bg-transparent">
      <TabsTrigger value="reasons" className="px-4 py-2">Reasons</TabsTrigger>
      <TabsTrigger value="analytics" className="px-4 py-2">Analytics</TabsTrigger>
    </TabsList>
    <TabsContent value="reasons" className="mt-4"><ReasonSection pollId={props.pollId} options={props.options} isUserLoggedIn={props.isUserLoggedIn} hasVoted={props.hasVoted} userVoteOptionId={props.userVoteOptionId} hasReason={props.hasReason} onReasonAdded={props.onReasonAdded} initialReasons={props.initialReasons} /></TabsContent>
    <TabsContent value="analytics" className="mt-4"><PollAnalyticsTab analytics={props.analytics} pollId={props.pollId} canRefreshInsights={props.canRefreshInsights} /></TabsContent>
  </Tabs>;
}
