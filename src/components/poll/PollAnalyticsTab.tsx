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

const chartColors = ["#e16540", "#4f7cac", "#69a05a", "#d19a32", "#8965ad", "#cf5d86"];
const voteDistributionConfig = {
  voteCount: {
    label: "Votes",
    color: "color-mix(in oklab, var(--primary) 20%, transparent)",
  },
  // label: {
  //   color: "var(--primary)",
  // },
} satisfies ChartConfig;

const tooltipStyle = {
  border: "1px solid var(--border)",
  borderRadius: "12px",
  background: "var(--card)",
  boxShadow: "0 10px 30px rgba(20, 20, 20, 0.1)",
  fontSize: "12px",
};

function ResponsiveContainer(props: React.ComponentProps<typeof RechartsResponsiveContainer>) {
  return <RechartsResponsiveContainer minWidth={0} minHeight={0} initialDimension={{ width: 320, height: 200 }} {...props} />;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">{children}</div>;
}

function SectionCard({ icon: Icon, title, description, action, children }: { icon: typeof Vote; title: string; description: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <Card><CardHeader><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="rounded-lg bg-muted p-2"><Icon className="size-4" aria-hidden="true" /></div><div><CardTitle><h2>{title}</h2></CardTitle><CardDescription>{description}</CardDescription></div></div>{action}</div></CardHeader><CardContent>{children}</CardContent></Card>;
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

  return <div className="space-y-5 pt-2">
    <section aria-labelledby="poll-overview-heading"><div className="mb-3"><h2 id="poll-overview-heading" className="text-lg font-semibold">Poll overview</h2><p className="text-sm text-muted-foreground">Current participation and engagement totals.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{overview.map(({ label, value, icon: Icon }) => <Card key={label} size="sm"><CardContent><span className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary/20"><Icon className="size-4" aria-hidden="true" /></span><p className="text-xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></CardContent></Card>)}</div></section>

    <SectionCard icon={BarChart3} title="Vote distribution" description="Current votes and share for each option." action={<label className="shrink-0"><span className="sr-only">Chart type</span><select value={voteChartType} onChange={(event) => setVoteChartType(event.target.value as "bar" | "donut" | "pie")} className="cursor-pointer rounded-lg border bg-background px-3 py-2 text-xs font-medium outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="bar">Bar chart</option><option value="donut">Donut chart</option><option value="pie">Pie chart</option></select></label>}>
      {analytics.overview.totalVotes === 0 ? <Empty>No votes have been cast yet.</Empty>
        : <>
          {voteChartType === "bar" && <div className="mb-3 flex justify-end"><Button type="button" variant="outline" size="sm" onClick={() => setHorizontalBars((current) => !current)}>Switch to {horizontalBars ? "Vertical" : "Horizontal"}</Button></div>}
          {voteChartType === "bar" ? <ChartContainer config={voteDistributionConfig} className="w-full aspect-auto" style={{ height: horizontalBars ? Math.max(190, analytics.voteDistribution.length * 48) : 320 }} aria-hidden="true">
            <BarChart accessibilityLayer data={voteDistributionData} layout={horizontalBars ? "vertical" : "horizontal"} margin={horizontalBars ? { right: 88 } : { top: 24, right: 16, left: 16, bottom: 28 }}>
              <CartesianGrid horizontal={!horizontalBars} vertical={horizontalBars} />
              {horizontalBars ? <><YAxis dataKey="optionText" type="category" axisLine={false} tickLine={false} hide /><XAxis dataKey="voteCount" type="number" hide /></> : <><XAxis dataKey="optionText" type="category" axisLine={false} tickLine={false} interval={0} tickFormatter={(value) => String(value).length > 12 ? `${String(value).slice(0, 12)}…` : String(value)} /><YAxis dataKey="voteCount" type="number" hide /></>}
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" labelKey="optionText" formatter={(value, _name, item) => <div className="flex min-w-36 flex-1 items-center justify-between gap-4">
                <span className="text-muted-foreground">Votes</span><span className="font-mono font-medium tabular-nums">{Number(value).toLocaleString()} ({item.payload.percentage}%)</span>
              </div>} />}
              />
              <Bar dataKey="voteCount" fill="var(--color-voteCount)" radius={4}>
                <LabelList dataKey="optionText" position="insideLeft" offset={8} className={horizontalBars ? "fill-primary font-medium" : "hidden"} fontSize={14} formatter={(value: React.ReactNode) => { const label = String(value); return label.length > 28 ? `${label.slice(0, 28)}…` : label; }} />
                <LabelList dataKey="voteLabel" position={horizontalBars ? "right" : "top"} offset={8} className="fill-foreground font-semibold" fontSize={12} />
              </Bar>
            </BarChart>
          </ChartContainer> : <div className="relative h-[340px] w-full" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analytics.voteDistribution} dataKey="voteCount" nameKey="optionText" cx="50%" cy="46%" outerRadius={105} innerRadius={voteChartType === "donut" ? 62 : 0} paddingAngle={voteChartType === "donut" ? 2 : 1} stroke="var(--card)" strokeWidth={2}>{analytics.voteDistribution.map((option, index) => <Cell key={option.optionId} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(value, _name, item) => [`${Number(value).toLocaleString()} votes (${item.payload.percentage}%)`, item.payload.optionText]} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} /></PieChart></ResponsiveContainer>{voteChartType === "donut" && <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-7"><div className="text-center"><p className="text-xl font-semibold tabular-nums">{analytics.overview.totalVotes.toLocaleString()}</p><p className="text-[11px] text-muted-foreground">Total votes</p></div></div>}</div>}
          <p className="sr-only">{analytics.voteDistribution.map((item) => `${item.optionText}: ${item.voteCount} votes, ${item.percentage}%`).join(". ")}.</p>
        </>}
    </SectionCard>

    <SectionCard icon={Activity} title="Vote timeline" description={`Votes per ${analytics.timeline.granularity}, with missing intervals shown as zero.`}>
      {analytics.overview.totalVotes === 0 ? <Empty>The timeline will appear after the first vote.</Empty> : <><div className="h-64 w-full" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><AreaChart data={analytics.timeline.points} margin={{ left: -20, right: 8, top: 12 }}><defs><linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e16540" stopOpacity={0.35} /><stop offset="100%" stopColor="#e16540" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="label" minTickGap={30} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [Number(value).toLocaleString(), "Votes"]} /><Area type="monotone" dataKey="voteCount" stroke={chartColors[0]} strokeWidth={2.5} fill="url(#timelineGradient)" dot={false} activeDot={{ r: 5, fill: "#e16540", stroke: "var(--card)", strokeWidth: 2 }} /></AreaChart></ResponsiveContainer></div><p className="sr-only">The busiest displayed interval received {Math.max(...analytics.timeline.points.map((point) => point.voteCount))} votes.</p></>}
    </SectionCard>

    <section aria-labelledby="audience-heading"><div className="mb-3"><h2 id="audience-heading" className="text-lg font-semibold">Audience</h2><p className="text-sm text-muted-foreground">Audience analytics are aggregated and may not include every voter.</p></div><div className="grid grid-cols-1 gap-4">
      <Card><CardHeader><CardTitle><span className="flex items-center gap-2"><Users className="size-4" aria-hidden="true" />Age by poll option</span></CardTitle><CardDescription>Vote distribution across self-reported age groups and poll options.</CardDescription></CardHeader><CardContent>{analytics.audience.age.isPrivate ? <Empty>Not enough age data yet.</Empty> : ageChartData.length === 0 ? <Empty>No age-group votes have been collected yet.</Empty> : <><div className="h-80 w-full" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart data={ageChartData} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}><CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="ageGroup" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} /><Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} contentStyle={tooltipStyle} formatter={(value, name) => [`${Number(value).toLocaleString()} votes`, String(name)]} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />{ageOptions.map((option, index) => <Bar key={option.optionId} dataKey={`option_${option.optionId}`} name={option.optionText} stackId="age" fill={chartColors[index % chartColors.length]} maxBarSize={56} />)}</BarChart></ResponsiveContainer></div>{largestAgeGroup && <p className="sr-only">{largestAgeGroup.label} recorded the most age-group votes with {largestAgeGroup.totalVotes}.</p>}</>}<p className="mt-3 text-xs text-muted-foreground">Based on {analytics.audience.age.coverage.coveragePercentage}% of voters who provided an age range.</p></CardContent></Card>
      <Card><CardHeader><CardTitle><span className="flex items-center gap-2"><Users className="size-4" aria-hidden="true" />Gender by poll option</span></CardTitle><CardDescription>Vote distribution across self-reported gender groups and poll options.</CardDescription></CardHeader><CardContent>{analytics.audience.gender.isPrivate ? <Empty>Not enough gender data yet.</Empty> : genderChartData.length === 0 ? <Empty>No gender-group votes have been collected yet.</Empty> : <><div className="h-80 w-full" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart data={genderChartData} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}><CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="gender" axisLine={false} tickLine={false} interval={0} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} /><Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} contentStyle={tooltipStyle} formatter={(value, name) => [`${Number(value).toLocaleString()} votes`, String(name)]} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />{genderOptions.map((option, index) => <Bar key={option.optionId} dataKey={`option_${option.optionId}`} name={option.optionText} stackId="gender" fill={chartColors[index % chartColors.length]} maxBarSize={56} />)}</BarChart></ResponsiveContainer></div>{largestGenderGroup && <p className="sr-only">{largestGenderGroup.label} recorded the most gender-group votes with {largestGenderGroup.totalVotes}.</p>}</>}<p className="mt-3 text-xs text-muted-foreground">Based on {analytics.audience.gender.coverage.coveragePercentage}% of voters who provided a gender response.</p></CardContent></Card>
      <Card><CardHeader><CardTitle><span className="flex items-center gap-2"><MapPin className="size-4" aria-hidden="true" />Location by poll option</span></CardTitle><CardDescription>Percentage distribution of poll options within each country.</CardDescription></CardHeader><CardContent>{locationChartData.length ? <><div className="w-full" style={{ height: Math.max(300, locationChartData.length * 58) }} aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={locationChartData} margin={{ top: 12, right: 20, left: 12, bottom: 12 }}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" /><XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} allowDecimals={false} /><YAxis type="category" dataKey="country" width={110} tick={{ fontSize: 12, fill: "var(--foreground)" }} /><Tooltip contentStyle={tooltipStyle} formatter={(value, name, item) => { const voteKey = String(item.dataKey).replace(/Pct$/, "Votes"); return [`${Number(value).toFixed(1)}% (${Number(item.payload[voteKey] ?? 0).toLocaleString()} votes)`, String(name)]; }} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />{locationOptions.map((option, index) => <Bar key={option.optionId} dataKey={`option_${option.optionId}Pct`} name={option.optionText} stackId="country" fill={chartColors[index % chartColors.length]} maxBarSize={42} />)}</BarChart></ResponsiveContainer></div><p className="sr-only">{locationGroups.map((group) => `${group.label}: ${group.totalVotes} recorded votes`).join(". ")}.</p></> : <Empty>No country data has been received from the deployment platform yet.</Empty>}</CardContent></Card>
      <Card><CardHeader><CardTitle><span className="flex items-center gap-2"><MonitorSmartphone className="size-4" aria-hidden="true" />Device by poll option</span></CardTitle><CardDescription>Percentage distribution of poll options within each device category.</CardDescription></CardHeader><CardContent>{deviceChartData.length ? <><div className="w-full" style={{ height: Math.max(260, deviceChartData.length * 68) }} aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={deviceChartData} margin={{ top: 12, right: 20, left: 12, bottom: 12 }}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" /><XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} allowDecimals={false} /><YAxis type="category" dataKey="device" width={90} tick={{ fontSize: 12, fill: "var(--foreground)" }} /><Tooltip contentStyle={tooltipStyle} formatter={(value, name, item) => { const voteKey = String(item.dataKey).replace(/Pct$/, "Votes"); return [`${Number(value).toFixed(1)}% (${Number(item.payload[voteKey] ?? 0).toLocaleString()} votes)`, String(name)]; }} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />{deviceOptions.map((option, index) => <Bar key={option.optionId} dataKey={`option_${option.optionId}Pct`} name={option.optionText} stackId="device" fill={chartColors[index % chartColors.length]} maxBarSize={42} />)}</BarChart></ResponsiveContainer></div><p className="sr-only">{deviceGroups.map((group) => `${group.label}: ${group.totalVotes} recorded votes`).join(". ")}.</p></> : <Empty>No device data has been collected yet.</Empty>}</CardContent></Card>
    </div></section>

    {analytics.aiEnabled && <>
      <SectionCard icon={SmilePlus} title="Reasons sentiment" description="AI-estimated tone of submitted reasons, not support or opposition.">{analytics.sentiment.analyzedReasons === 0 ? <Empty>Not enough reasons for sentiment analysis.</Empty> : <RankedList items={sentimentItems} />}<p className="mt-3 text-xs text-muted-foreground">Analyzed {analytics.sentiment.analyzedReasons} of {analytics.sentiment.totalReasons} reasons. AI-generated tone analysis may be imperfect.</p></SectionCard>

      <SectionCard icon={Brain} title="AI summary" description="A Gemini Flash summary of votes, representative reasons, sentiment, and themes.">{analytics.insights ? <div className="space-y-4"><p className="leading-6">{analytics.insights.summary}</p>{analytics.insights.optionSummaries.map((item) => <div key={item.optionId} className="rounded-lg bg-muted/60 p-3"><p className="text-sm">{item.summary}</p>{item.keyThemes.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Themes: {item.keyThemes.join(", ")}</p>}</div>)}<p className="text-xs text-muted-foreground">Generated {formatRelativeTime(analytics.insights.generatedAt)} with {analytics.insights.modelName ?? "Gemini Flash"}. This describes only participants in this poll.</p></div> : <Empty>{!analytics.aiConfigured ? "AI summary is unavailable because Gemini is not configured." : !analytics.aiEligible ? "AI insights will appear when this poll has at least 10 votes and 5 meaningful reasons." : "AI insights are ready to be generated after the next qualifying reason or an authorized refresh."}</Empty>}{canRefreshInsights && analytics.aiConfigured && analytics.aiEligible && <div className="mt-4 flex items-center gap-3"><Button size="sm" variant="outline" disabled={isRefreshing} onClick={() => startTransition(async () => { const result = await refreshPollInsightsAction(pollId); setRefreshMessage(result.message); if (result.success) router.refresh(); })}>{isRefreshing ? "Refreshing…" : "Refresh AI insights"}</Button>{refreshMessage && <span className="text-xs text-muted-foreground" role="status">{refreshMessage}</span>}</div>}</SectionCard>

      <SectionCard icon={Lightbulb} title="Interesting facts" description="Notable, poll-specific patterns supported by collected data.">{[...analytics.facts, ...(analytics.insights?.interestingFacts ?? []).map((fact) => ({ text: fact.text, type: fact.type }))].length === 0 ? <Empty>Interesting facts will appear as participation grows.</Empty> : <ul className="space-y-3">{[...analytics.facts, ...(analytics.insights?.interestingFacts ?? []).map((fact) => ({ text: fact.text, type: fact.type }))].map((fact, index) => <li key={`${fact.type}-${index}`} className="flex gap-3 rounded-lg bg-muted/60 p-3"><Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><span>{fact.text}</span></li>)}</ul>}</SectionCard>
    </>}
  </div>;
}
