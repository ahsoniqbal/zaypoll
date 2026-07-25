"use client";

import type { PollAnalytics } from "@/types/poll-analytics.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, Brain, CalendarDays, Clock3, Eye, Lightbulb, MapPin, MessageSquareText, MonitorSmartphone, SmilePlus, ThumbsUp, Users, Vote } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { refreshPollInsightsAction } from "@/actions/poll.actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

const chartColors = ["var(--chart-1, #e16540)", "var(--chart-2, #ed8b6d)", "var(--chart-3, #b84d2e)", "var(--chart-4, #eab09d)", "var(--chart-5, #783824)"];
const tooltipStyle = {
  border: "1px solid var(--border)",
  borderRadius: "12px",
  background: "var(--card)",
  boxShadow: "0 10px 30px rgba(20, 20, 20, 0.1)",
  fontSize: "12px",
};

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">{children}</div>;
}

function SectionCard({ icon: Icon, title, description, children }: { icon: typeof Vote; title: string; description: string; children: React.ReactNode }) {
  return <Card><CardHeader><div className="flex items-start gap-3"><div className="rounded-lg bg-muted p-2"><Icon className="size-4" aria-hidden="true" /></div><div><CardTitle><h2>{title}</h2></CardTitle><CardDescription>{description}</CardDescription></div></div></CardHeader><CardContent>{children}</CardContent></Card>;
}

function RankedList({ items }: { items: Array<{ label: string; count: number; percentage: number }> }) {
  if (!items.length) return <Empty>No aggregated data has been collected yet.</Empty>;
  return <ul className="space-y-3">{items.map((item) => <li key={item.label}><div className="mb-1 flex justify-between gap-4 text-sm"><span className="font-medium">{item.label}</span><span className="text-muted-foreground">{item.count.toLocaleString()} · {item.percentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${item.percentage}%` }} /></div></li>)}</ul>;
}

export default function PollAnalyticsTab({ analytics, pollId, canRefreshInsights }: { analytics: PollAnalytics; pollId: number; canRefreshInsights: boolean }) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const overview = [
    { label: "Total votes", value: analytics.overview.totalVotes.toLocaleString(), icon: Vote },
    { label: "Views", value: analytics.overview.views.toLocaleString(), icon: Eye },
    { label: "Reasons", value: analytics.overview.reasons.toLocaleString(), icon: MessageSquareText },
    { label: "Reactions", value: analytics.overview.reactions.toLocaleString(), icon: ThumbsUp },
    { label: "Created", value: format(new Date(analytics.overview.createdAt), "MMM d, yyyy"), icon: CalendarDays },
    { label: "Duration", value: analytics.overview.duration, icon: Clock3 },
  ];
  const sentimentItems = [
    { label: "Positive tone", count: analytics.sentiment.positive, percentage: 0 },
    { label: "Neutral tone", count: analytics.sentiment.neutral, percentage: 0 },
    { label: "Negative tone", count: analytics.sentiment.negative, percentage: 0 },
  ].map((item) => ({ ...item, percentage: analytics.sentiment.analyzedReasons ? Math.round(item.count / analytics.sentiment.analyzedReasons * 1000) / 10 : 0 }));

  return <div className="space-y-5 pt-2">
    <section aria-labelledby="poll-overview-heading"><div className="mb-3"><h2 id="poll-overview-heading" className="text-lg font-semibold">Poll overview</h2><p className="text-sm text-muted-foreground">Current participation and engagement totals.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{overview.map(({ label, value, icon: Icon }) => <Card key={label} size="sm"><CardContent><span className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" aria-hidden="true" /></span><p className="text-xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></CardContent></Card>)}</div></section>

    <SectionCard icon={BarChart3} title="Vote distribution" description="Current votes and share for each option.">
      {analytics.overview.totalVotes === 0 ? <Empty>No votes have been cast yet.</Empty> : <><div className="h-72 w-full" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.voteDistribution} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}><defs><linearGradient id="voteBarGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#e16540" /><stop offset="100%" stopColor="#ed8b6d" /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="4 4" horizontal={false} /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} /><YAxis type="category" dataKey="optionText" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--foreground)" }} tickFormatter={(value) => String(value).slice(0, 16)} /><Tooltip cursor={{ fill: "var(--muted)", opacity: 0.45 }} contentStyle={tooltipStyle} formatter={(value, _name, item) => [`${Number(value).toLocaleString()} votes (${item.payload.percentage}%)`, "Votes"]} /><Bar dataKey="voteCount" fill="url(#voteBarGradient)" radius={[0, 8, 8, 0]} maxBarSize={28} /></BarChart></ResponsiveContainer></div><RankedList items={analytics.voteDistribution.map((item) => ({ label: item.optionText, count: item.voteCount, percentage: item.percentage }))} /></>}
    </SectionCard>

    <SectionCard icon={Activity} title="Vote timeline" description={`Votes per ${analytics.timeline.granularity}, with missing intervals shown as zero.`}>
      {analytics.overview.totalVotes === 0 ? <Empty>The timeline will appear after the first vote.</Empty> : <><div className="h-64 w-full" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><AreaChart data={analytics.timeline.points} margin={{ left: -20, right: 8, top: 12 }}><defs><linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e16540" stopOpacity={0.35} /><stop offset="100%" stopColor="#e16540" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="label" minTickGap={30} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [Number(value).toLocaleString(), "Votes"]} /><Area type="monotone" dataKey="voteCount" stroke={chartColors[0]} strokeWidth={2.5} fill="url(#timelineGradient)" dot={false} activeDot={{ r: 5, fill: "#e16540", stroke: "var(--card)", strokeWidth: 2 }} /></AreaChart></ResponsiveContainer></div><p className="sr-only">The busiest displayed interval received {Math.max(...analytics.timeline.points.map((point) => point.voteCount))} votes.</p></>}
    </SectionCard>

    <section aria-labelledby="audience-heading"><div className="mb-3"><h2 id="audience-heading" className="text-lg font-semibold">Audience</h2><p className="text-sm text-muted-foreground">Audience analytics are aggregated and may not include every voter.</p></div><div className="grid grid-cols-1 gap-4">
      <Card><CardHeader><CardTitle><span className="flex items-center gap-2"><Users className="size-4" aria-hidden="true" />Age</span></CardTitle><CardDescription>Optional, self-reported ranges.</CardDescription></CardHeader><CardContent>{analytics.audience.age.isPrivate ? <Empty>Not enough age data yet.</Empty> : <RankedList items={analytics.audience.age.items} />}<p className="mt-3 text-xs text-muted-foreground">Based on {analytics.audience.age.coverage.coveragePercentage}% of voters who provided an age range.</p></CardContent></Card>
      <Card><CardHeader><CardTitle><span className="flex items-center gap-2"><MapPin className="size-4" aria-hidden="true" />Location</span></CardTitle><CardDescription>Country-level data only.</CardDescription></CardHeader><CardContent>{analytics.audience.locations.length ? <RankedList items={analytics.audience.locations} /> : <Empty>No country data has been received from the deployment platform yet.</Empty>}</CardContent></Card>
      <Card><CardHeader><CardTitle><span className="flex items-center gap-2"><MonitorSmartphone className="size-4" aria-hidden="true" />Device</span></CardTitle><CardDescription>Normalized device categories.</CardDescription></CardHeader><CardContent><RankedList items={analytics.audience.devices} /></CardContent></Card>
    </div></section>

    {analytics.aiEnabled && <>
    <SectionCard icon={SmilePlus} title="Reasons sentiment" description="AI-estimated tone of submitted reasons, not support or opposition.">{analytics.sentiment.analyzedReasons === 0 ? <Empty>Not enough reasons for sentiment analysis.</Empty> : <RankedList items={sentimentItems} />}<p className="mt-3 text-xs text-muted-foreground">Analyzed {analytics.sentiment.analyzedReasons} of {analytics.sentiment.totalReasons} reasons. AI-generated tone analysis may be imperfect.</p></SectionCard>

    <SectionCard icon={Brain} title="AI summary" description="A Gemini Flash summary of votes, representative reasons, sentiment, and themes.">{analytics.insights ? <div className="space-y-4"><p className="leading-6">{analytics.insights.summary}</p>{analytics.insights.optionSummaries.map((item) => <div key={item.optionId} className="rounded-lg bg-muted/60 p-3"><p className="text-sm">{item.summary}</p>{item.keyThemes.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Themes: {item.keyThemes.join(", ")}</p>}</div>)}<p className="text-xs text-muted-foreground">Generated {format(new Date(analytics.insights.generatedAt), "MMM d, yyyy")} with {analytics.insights.modelName ?? "Gemini Flash"}. This describes only participants in this poll.</p></div> : <Empty>{!analytics.aiConfigured ? "AI summary is unavailable because Gemini is not configured." : !analytics.aiEligible ? "AI insights will appear when this poll has at least 10 votes and 5 meaningful reasons." : "AI insights are ready to be generated after the next qualifying reason or an authorized refresh."}</Empty>}{canRefreshInsights && analytics.aiConfigured && analytics.aiEligible && <div className="mt-4 flex items-center gap-3"><Button size="sm" variant="outline" disabled={isRefreshing} onClick={() => startTransition(async () => { const result = await refreshPollInsightsAction(pollId); setRefreshMessage(result.message); if (result.success) router.refresh(); })}>{isRefreshing ? "Refreshing…" : "Refresh AI insights"}</Button>{refreshMessage && <span className="text-xs text-muted-foreground" role="status">{refreshMessage}</span>}</div>}</SectionCard>

    <SectionCard icon={Lightbulb} title="Interesting facts" description="Notable, poll-specific patterns supported by collected data.">{[...analytics.facts, ...(analytics.insights?.interestingFacts ?? []).map((fact) => ({ text: fact.text, type: fact.type }))].length === 0 ? <Empty>Interesting facts will appear as participation grows.</Empty> : <ul className="space-y-3">{[...analytics.facts, ...(analytics.insights?.interestingFacts ?? []).map((fact) => ({ text: fact.text, type: fact.type }))].map((fact, index) => <li key={`${fact.type}-${index}`} className="flex gap-3 rounded-lg bg-muted/60 p-3"><Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><span>{fact.text}</span></li>)}</ul>}</SectionCard>
    </>}
  </div>;
}
