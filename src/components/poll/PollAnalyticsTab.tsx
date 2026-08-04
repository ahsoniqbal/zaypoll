"use client";

import type { PollAnalytics } from "@/types/poll-analytics.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Activity, BarChart3, Brain, CalendarDays, Clock3, Eye, Lightbulb, MapPin, MessageSquareText, MonitorSmartphone, SmilePlus, ThumbsUp, Users, Vote } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart, ResponsiveContainer as RechartsResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { refreshPollInsightsAction } from "@/actions/poll.actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";

const chartColors = ["#e16540", "#4f7cac", "#3f9b78", "#8b6bb1", "#d49a3a", "#cf668c"];
const voteDistributionConfig = {
  voteCount: {
    label: "Votes",
    // color: "color-mix(in oklab, var(--primary) 10%, transparent)",
    color: "#e16540"
  },
  // label: {
  //   color: "var(--primary)",
  // },
} satisfies ChartConfig;

const tooltipStyle = {
  border: "1px solid var(--border)",
  borderRadius: "14px",
  background: "var(--popover)",
  boxShadow: "0 16px 40px rgba(20, 20, 20, 0.12)",
  fontSize: "12px",
  padding: "10px 12px",
};

const axisTick = { fontSize: 11, fill: "var(--muted-foreground)" };
const chartCursor = { fill: "var(--muted)", opacity: 0.45 };

function stackedBarRadius(index: number, total: number): [number, number, number, number] {
  if (total === 1) return [6, 6, 6, 6];
  if (index === 0) return [6, 0, 0, 6];
  if (index === total - 1) return [0, 6, 6, 0];
  return [0, 0, 0, 0];
}

function stackedColumnRadius(index: number, total: number): [number, number, number, number] {
  if (total === 1) return [6, 6, 6, 6];
  if (index === 0) return [0, 0, 6, 6];
  if (index === total - 1) return [6, 6, 0, 0];
  return [0, 0, 0, 0];
}

function ResponsiveContainer(props: React.ComponentProps<typeof RechartsResponsiveContainer>) {
  return <RechartsResponsiveContainer minWidth={0} minHeight={0} initialDimension={{ width: 320, height: 200 }} {...props} />;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">{children}</div>;
}

function SectionCard({ icon: Icon, title, description, action, children }: { icon: typeof Vote; title: string; description: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <Card className="bg-gradient-to-b from-card to-muted/10"><CardHeader className="border-b pb-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/10"><Icon className="size-4" aria-hidden="true" /></div><div><CardTitle><h2>{title}</h2></CardTitle><CardDescription className="mt-0.5">{description}</CardDescription></div></div>{action}</div></CardHeader><CardContent>{children}</CardContent></Card>;
}

function RankedList({ items }: { items: Array<{ label: string; count: number; percentage: number }> }) {
  if (!items.length) return <Empty>No aggregated data has been collected yet.</Empty>;
  return <ul className="space-y-3">{items.map((item) => <li key={item.label}><div className="mb-1 flex justify-between gap-4 text-sm"><span className="font-medium">{item.label}</span><span className="text-muted-foreground">{item.count.toLocaleString()} · {item.percentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${item.percentage}%` }} /></div></li>)}</ul>;
}

export default function PollAnalyticsTab({ analytics, pollId, canRefreshInsights }: { analytics: PollAnalytics; pollId: number; canRefreshInsights: boolean }) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [voteChartType, setVoteChartType] = useState<"bar" | "donut" | "pie">("bar");
  const [horizontalBars, setHorizontalBars] = useState(true);
  const voteDistributionData = analytics.voteDistribution.map((item) => ({
    ...item,
    voteLabel: `${item.voteCount.toLocaleString()} (${item.percentage}%)`,
  }));
  const overview = [
    { label: "Total votes", value: analytics.overview.totalVotes.toLocaleString(), icon: Vote },
    { label: "Views", value: analytics.overview.views.toLocaleString(), icon: Eye },
    { label: "Reasons", value: analytics.overview.reasons.toLocaleString(), icon: MessageSquareText },
    { label: "Reactions", value: analytics.overview.reactions.toLocaleString(), icon: ThumbsUp },
    { label: "Created", value: formatRelativeTime(analytics.overview.createdAt), icon: CalendarDays },
    { label: "Duration", value: analytics.overview.duration, icon: Clock3 },
  ];
  const sentimentItems = [
    { label: "Positive tone", count: analytics.sentiment.positive, percentage: 0 },
    { label: "Neutral tone", count: analytics.sentiment.neutral, percentage: 0 },
    { label: "Negative tone", count: analytics.sentiment.negative, percentage: 0 },
  ].map((item) => ({ ...item, percentage: analytics.sentiment.analyzedReasons ? Math.round(item.count / analytics.sentiment.analyzedReasons * 1000) / 10 : 0 }));
  const ageGroups = analytics.audience.age.groups ?? [];
  const ageOptions = analytics.audience.age.options ?? [];
  const ageChartData = ageGroups.map((group) => ({
    ageGroup: group.label,
    totalVotes: group.totalVotes,
    ...Object.fromEntries(group.optionVotes.map((option) => [`option_${option.optionId}`, option.voteCount])),
  }));
  const largestAgeGroup = ageGroups.reduce(
    (largest, group) => !largest || group.totalVotes > largest.totalVotes ? group : largest,
    null as PollAnalytics["audience"]["age"]["groups"][number] | null,
  );
  const genderGroups = analytics.audience.gender.groups ?? [];
  const genderOptions = analytics.audience.gender.options ?? [];
  const genderChartData = genderGroups.map((group) => ({
    gender: group.label,
    totalVotes: group.totalVotes,
    ...Object.fromEntries(group.optionVotes.map((option) => [`option_${option.optionId}`, option.voteCount])),
  }));
  const largestGenderGroup = genderGroups.reduce(
    (largest, group) => !largest || group.totalVotes > largest.totalVotes ? group : largest,
    null as PollAnalytics["audience"]["gender"]["groups"][number] | null,
  );
  const locationGroups = analytics.audience.locations.groups ?? [];
  const locationOptions = analytics.audience.locations.options ?? [];
  const locationChartData = locationGroups.map((group) => ({
    country: group.label,
    totalVotes: group.totalVotes,
    ...Object.fromEntries(group.optionVotes.flatMap((option) => [
      [`option_${option.optionId}Pct`, option.percentage],
      [`option_${option.optionId}Votes`, option.voteCount],
    ])),
  }));
  const deviceGroups = analytics.audience.devices.groups ?? [];
  const deviceOptions = analytics.audience.devices.options ?? [];
  const deviceChartData = deviceGroups.map((group) => ({
    device: group.label,
    totalVotes: group.totalVotes,
    ...Object.fromEntries(group.optionVotes.flatMap((option) => [
      [`option_${option.optionId}Pct`, option.percentage],
      [`option_${option.optionId}Votes`, option.voteCount],
    ])),
  }));

  return <div className="poll-analytics space-y-6 pt-2">
    <section aria-labelledby="poll-overview-heading"><div className="mb-3"><h2 id="poll-overview-heading" className="text-lg font-semibold tracking-tight">Poll overview</h2><p className="mt-0.5 text-sm text-muted-foreground">Current participation and engagement totals.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{overview.map(({ label, value, icon: Icon }) => <Card key={label} size="sm" className="relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 transition-shadow hover:shadow-sm"><CardContent><span className="mb-4 flex size-8 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/10"><Icon className="size-4" aria-hidden="true" /></span><p className="text-xl font-semibold tracking-tight tabular-nums">{value}</p><p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p></CardContent></Card>)}</div></section>
 
    <SectionCard icon={BarChart3} title="Vote distribution" description="Current votes and share for each option." action={<label className="shrink-0"><span className="sr-only">Chart type</span><select value={voteChartType} onChange={(event) => setVoteChartType(event.target.value as "bar" | "donut" | "pie")} className="cursor-pointer rounded-full border bg-background px-3.5 py-2 text-xs font-medium shadow-xs outline-none transition hover:bg-muted/50 focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="bar">Bar chart</option><option value="donut">Donut chart</option><option value="pie">Pie chart</option></select></label>}>
      {analytics.overview.totalVotes === 0 ? <Empty>No votes have been cast yet.</Empty>
        : <>
          {voteChartType === "bar" && <div className="mb-3 flex justify-end"><Button type="button" variant="ghost" size="sm" className="rounded-full bg-muted/60 px-3 text-xs" onClick={() => setHorizontalBars((current) => !current)}>Switch to {horizontalBars ? "Vertical" : "Horizontal"}</Button></div>}
          {voteChartType === "bar" ? <ChartContainer config={voteDistributionConfig} className="w-full rounded-xl bg-muted/25 p-2 aspect-auto" style={{ height: horizontalBars ? Math.max(190, analytics.voteDistribution.length * 48) : 320 }} aria-hidden="true">
            <BarChart accessibilityLayer data={voteDistributionData} layout={horizontalBars ? "vertical" : "horizontal"} margin={horizontalBars ? { right: 88 } : { top: 24, right: 16, left: 16, bottom: 28 }}>
              <CartesianGrid horizontal={!horizontalBars} vertical={horizontalBars} stroke="var(--border)" strokeDasharray="4 6" opacity={0.65} />
              {horizontalBars ? <><YAxis dataKey="optionText" type="category" axisLine={false} tickLine={false} hide /><XAxis dataKey="voteCount" type="number" hide /></> : <><XAxis dataKey="optionText" type="category" axisLine={false} tickLine={false} interval={0} tickFormatter={(value) => String(value).length > 12 ? `${String(value).slice(0, 12)}…` : String(value)} /><YAxis dataKey="voteCount" type="number" hide /></>}
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator formatter={(value, _name, item) => <div className="grid min-w-48 max-w-72 flex-1 gap-2">
                <p className="whitespace-normal break-words font-semibold leading-snug">{item.payload.optionText}</p>
                <div className="flex items-center justify-between gap-4 border-t pt-2"><span className="text-muted-foreground">Votes</span><span className="font-mono font-medium tabular-nums">{Number(value).toLocaleString()} ({item.payload.percentage}%)</span></div>
              </div>} />}
              />
              <Bar dataKey="voteCount" fill="var(--color-voteCount)" radius={8} maxBarSize={44}>
                <LabelList dataKey="optionText" position="insideLeft" offset={8} className={horizontalBars ? "fill-white font-medium" : "hidden"} fontSize={14} formatter={(value: React.ReactNode) => { const label = String(value); return label.length > 28 ? `${label.slice(0, 28)}…` : label; }} />
                <LabelList dataKey="voteLabel" position={horizontalBars ? "right" : "top"} offset={8} className="fill-foreground font-semibold" fontSize={12} />
              </Bar>
            </BarChart>
          </ChartContainer> : <div className="relative h-[340px] w-full rounded-xl bg-muted/25 p-2" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analytics.voteDistribution} dataKey="voteCount" nameKey="optionText" cx="50%" cy="46%" outerRadius={105} innerRadius={voteChartType === "donut" ? 64 : 0} paddingAngle={3} cornerRadius={5} stroke="var(--card)" strokeWidth={3}>{analytics.voteDistribution.map((option, index) => <Cell key={option.optionId} fill={chartColors[index % chartColors.length]} className="outline-none transition-opacity hover:opacity-80" />)}</Pie><Tooltip cursor={chartCursor} contentStyle={{ ...tooltipStyle, maxWidth: "280px", whiteSpace: "normal" }} itemStyle={{ whiteSpace: "normal", overflowWrap: "anywhere" }} formatter={(value, _name, item) => [`${Number(value).toLocaleString()} votes (${item.payload.percentage}%)`, item.payload.optionText]} /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} /></PieChart></ResponsiveContainer>{voteChartType === "donut" && <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-7"><div className="rounded-full bg-card/85 px-4 py-3 text-center shadow-sm ring-1 ring-foreground/5"><p className="text-xl font-semibold tracking-tight tabular-nums">{analytics.overview.totalVotes.toLocaleString()}</p><p className="text-[11px] text-muted-foreground">Total votes</p></div></div>}</div>}
          <p className="sr-only">{analytics.voteDistribution.map((item) => `${item.optionText}: ${item.voteCount} votes, ${item.percentage}%`).join(". ")}.</p>
        </>}
    </SectionCard>

    <SectionCard icon={Activity} title="Vote timeline" description={`Votes per ${analytics.timeline.granularity}, with missing intervals shown as zero.`}>
      {analytics.overview.totalVotes === 0 ? <Empty>The timeline will appear after the first vote.</Empty> : <><div className="h-64 w-full rounded-xl bg-muted/25 p-2" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><AreaChart data={analytics.timeline.points} margin={{ left: -16, right: 12, top: 16, bottom: 4 }}><defs><linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e16540" stopOpacity={0.32} /><stop offset="65%" stopColor="#e16540" stopOpacity={0.08} /><stop offset="100%" stopColor="#e16540" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="4 6" vertical={false} opacity={0.65} /><XAxis dataKey="label" minTickGap={30} axisLine={false} tickLine={false} tick={axisTick} tickMargin={10} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={axisTick} /><Tooltip cursor={{ stroke: "var(--primary)", strokeOpacity: 0.25, strokeDasharray: "4 4" }} contentStyle={tooltipStyle} formatter={(value) => [Number(value).toLocaleString(), "Votes"]} /><Area type="monotone" dataKey="voteCount" stroke={chartColors[0]} strokeWidth={3} fill="url(#timelineGradient)" dot={false} activeDot={{ r: 5, fill: "#e16540", stroke: "var(--card)", strokeWidth: 3 }} /></AreaChart></ResponsiveContainer></div><p className="sr-only">The busiest displayed interval received {Math.max(...analytics.timeline.points.map((point) => point.voteCount))} votes.</p></>}
    </SectionCard>

    <section aria-labelledby="audience-heading"><div className="mb-3"><h2 id="audience-heading" className="text-lg font-semibold tracking-tight">Audience</h2><p className="mt-0.5 text-sm text-muted-foreground">Audience analytics are aggregated and may not include every voter.</p></div><div className="grid grid-cols-1 gap-5">
      <Card className="bg-gradient-to-b from-card to-muted/10"><CardHeader className="border-b pb-4"><CardTitle><span className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary"><Users className="size-4" aria-hidden="true" /></span>Age by poll option</span></CardTitle><CardDescription>Vote counts across self-reported age groups and poll options.</CardDescription></CardHeader><CardContent>{analytics.audience.age.isPrivate ? <Empty>Not enough age data yet.</Empty> : ageChartData.length === 0 ? <Empty>No age-group votes have been collected yet.</Empty> : <><div className="h-76 w-full" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart data={ageChartData} barCategoryGap="28%" margin={{ top: 12, right: 8, left: -12, bottom: 8 }}><CartesianGrid stroke="var(--border)" strokeDasharray="4 6" vertical={false} opacity={0.65} /><XAxis dataKey="ageGroup" axisLine={false} tickLine={false} interval={0} tick={axisTick} tickMargin={10} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={axisTick} /><Tooltip cursor={chartCursor} contentStyle={tooltipStyle} formatter={(value, name) => [`${Number(value).toLocaleString()} votes`, String(name)]} /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />{ageOptions.map((option, index) => <Bar key={option.optionId} dataKey={`option_${option.optionId}`} name={option.optionText} stackId="age" fill={chartColors[index % chartColors.length]} radius={stackedColumnRadius(index, ageOptions.length)} maxBarSize={46} />)}</BarChart></ResponsiveContainer></div>{largestAgeGroup && <p className="sr-only">{largestAgeGroup.label} recorded the most age-group votes with {largestAgeGroup.totalVotes}.</p>}</>}<p className="mt-3 inline-flex rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">{analytics.audience.age.coverage.coveragePercentage}% voter coverage</p></CardContent></Card>
      <Card className="bg-gradient-to-b from-card to-muted/10"><CardHeader className="border-b pb-4"><CardTitle><span className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary"><Users className="size-4" aria-hidden="true" /></span>Gender by poll option</span></CardTitle><CardDescription>Vote counts across self-reported gender groups and poll options.</CardDescription></CardHeader><CardContent>{analytics.audience.gender.isPrivate ? <Empty>Not enough gender data yet.</Empty> : genderChartData.length === 0 ? <Empty>No gender-group votes have been collected yet.</Empty> : <><div className="h-76 w-full" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart data={genderChartData} barCategoryGap="28%" margin={{ top: 12, right: 8, left: -12, bottom: 8 }}><CartesianGrid stroke="var(--border)" strokeDasharray="4 6" vertical={false} opacity={0.65} /><XAxis dataKey="gender" axisLine={false} tickLine={false} interval={0} tick={axisTick} tickMargin={10} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={axisTick} /><Tooltip cursor={chartCursor} contentStyle={tooltipStyle} formatter={(value, name) => [`${Number(value).toLocaleString()} votes`, String(name)]} /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />{genderOptions.map((option, index) => <Bar key={option.optionId} dataKey={`option_${option.optionId}`} name={option.optionText} stackId="gender" fill={chartColors[index % chartColors.length]} radius={stackedColumnRadius(index, genderOptions.length)} maxBarSize={46} />)}</BarChart></ResponsiveContainer></div>{largestGenderGroup && <p className="sr-only">{largestGenderGroup.label} recorded the most gender-group votes with {largestGenderGroup.totalVotes}.</p>}</>}<p className="mt-3 inline-flex rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">{analytics.audience.gender.coverage.coveragePercentage}% voter coverage</p></CardContent></Card>
      <Card className="bg-gradient-to-b from-card to-muted/10"><CardHeader className="border-b pb-4"><CardTitle><span className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary"><MapPin className="size-4" aria-hidden="true" /></span>Location by poll option</span></CardTitle><CardDescription>Share of poll choices within each country.</CardDescription></CardHeader><CardContent>{locationChartData.length ? <><div className="w-full" style={{ height: Math.max(240, locationChartData.length * 50 + 70) }} aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={locationChartData} barCategoryGap="24%" margin={{ top: 10, right: 12, left: 4, bottom: 12 }}><CartesianGrid stroke="var(--border)" strokeDasharray="4 6" horizontal={false} opacity={0.65} /><XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} allowDecimals={false} axisLine={false} tickLine={false} tick={axisTick} tickMargin={8} /><YAxis type="category" dataKey="country" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--foreground)" }} tickMargin={8} /><Tooltip cursor={chartCursor} contentStyle={tooltipStyle} formatter={(value, name, item) => { const voteKey = String(item.dataKey).replace(/Pct$/, "Votes"); return [`${Number(value).toFixed(1)}% (${Number(item.payload[voteKey] ?? 0).toLocaleString()} votes)`, String(name)]; }} /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />{locationOptions.map((option, index) => <Bar key={option.optionId} dataKey={`option_${option.optionId}Pct`} name={option.optionText} stackId="country" fill={chartColors[index % chartColors.length]} radius={stackedBarRadius(index, locationOptions.length)} maxBarSize={36} />)}</BarChart></ResponsiveContainer></div><p className="sr-only">{locationGroups.map((group) => `${group.label}: ${group.totalVotes} recorded votes`).join(". ")}.</p></> : <Empty>No country data has been received from the deployment platform yet.</Empty>}</CardContent></Card>
      <Card className="bg-gradient-to-b from-card to-muted/10"><CardHeader className="border-b pb-4"><CardTitle><span className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary"><MonitorSmartphone className="size-4" aria-hidden="true" /></span>Device by poll option</span></CardTitle><CardDescription>Share of poll choices within each device category.</CardDescription></CardHeader><CardContent>{deviceChartData.length ? <><div className="w-full" style={{ height: Math.max(220, deviceChartData.length * 50 + 70) }} aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={deviceChartData} barCategoryGap="24%" margin={{ top: 10, right: 12, left: 4, bottom: 12 }}><CartesianGrid stroke="var(--border)" strokeDasharray="4 6" horizontal={false} opacity={0.65} /><XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} allowDecimals={false} axisLine={false} tickLine={false} tick={axisTick} tickMargin={8} /><YAxis type="category" dataKey="device" width={82} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--foreground)" }} tickMargin={8} /><Tooltip cursor={chartCursor} contentStyle={tooltipStyle} formatter={(value, name, item) => { const voteKey = String(item.dataKey).replace(/Pct$/, "Votes"); return [`${Number(value).toFixed(1)}% (${Number(item.payload[voteKey] ?? 0).toLocaleString()} votes)`, String(name)]; }} /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />{deviceOptions.map((option, index) => <Bar key={option.optionId} dataKey={`option_${option.optionId}Pct`} name={option.optionText} stackId="device" fill={chartColors[index % chartColors.length]} radius={stackedBarRadius(index, deviceOptions.length)} maxBarSize={36} />)}</BarChart></ResponsiveContainer></div><p className="sr-only">{deviceGroups.map((group) => `${group.label}: ${group.totalVotes} recorded votes`).join(". ")}.</p></> : <Empty>No device data has been collected yet.</Empty>}</CardContent></Card>
    </div></section>

    {analytics.aiEnabled && <>
      <SectionCard icon={SmilePlus} title="Reasons sentiment" description="AI-estimated tone of submitted reasons, not support or opposition.">{analytics.sentiment.analyzedReasons === 0 ? <Empty>Not enough reasons for sentiment analysis.</Empty> : <RankedList items={sentimentItems} />}<p className="mt-3 text-xs text-muted-foreground">Analyzed {analytics.sentiment.analyzedReasons} of {analytics.sentiment.totalReasons} reasons. AI-generated tone analysis may be imperfect.</p></SectionCard>

      <SectionCard icon={Brain} title="AI summary" description="A Gemini Flash summary of votes, representative reasons, sentiment, and themes.">{analytics.insights ? <div className="space-y-4"><p className="leading-6">{analytics.insights.summary}</p>{analytics.insights.optionSummaries.map((item) => <div key={item.optionId} className="rounded-lg bg-muted/60 p-3"><p className="text-sm">{item.summary}</p>{item.keyThemes.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Themes: {item.keyThemes.join(", ")}</p>}</div>)}<p className="text-xs text-muted-foreground">Generated {formatRelativeTime(analytics.insights.generatedAt)} with {analytics.insights.modelName ?? "Gemini Flash"}. This describes only participants in this poll.</p></div> : <Empty>{!analytics.aiConfigured ? "AI summary is unavailable because Gemini is not configured." : !analytics.aiEligible ? "AI insights will appear when this poll has at least 10 votes and 5 meaningful reasons." : "AI insights are ready to be generated after the next qualifying reason or an authorized refresh."}</Empty>}{canRefreshInsights && analytics.aiConfigured && analytics.aiEligible && <div className="mt-4 flex items-center gap-3"><Button size="sm" variant="outline" disabled={isRefreshing} onClick={() => startTransition(async () => { const result = await refreshPollInsightsAction(pollId); setRefreshMessage(result.message); if (result.success) router.refresh(); })}>{isRefreshing ? "Refreshing…" : "Refresh AI insights"}</Button>{refreshMessage && <span className="text-xs text-muted-foreground" role="status">{refreshMessage}</span>}</div>}</SectionCard>

      <SectionCard icon={Lightbulb} title="Interesting facts" description="Notable, poll-specific patterns supported by collected data.">{[...analytics.facts, ...(analytics.insights?.interestingFacts ?? []).map((fact) => ({ text: fact.text, type: fact.type }))].length === 0 ? <Empty>Interesting facts will appear as participation grows.</Empty> : <ul className="space-y-3">{[...analytics.facts, ...(analytics.insights?.interestingFacts ?? []).map((fact) => ({ text: fact.text, type: fact.type }))].map((fact, index) => <li key={`${fact.type}-${index}`} className="flex gap-3 rounded-lg bg-muted/60 p-3"><Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><span>{fact.text}</span></li>)}</ul>}</SectionCard>
    </>}
  </div>;
}
