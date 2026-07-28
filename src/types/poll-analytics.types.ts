export type AnalyticsTab = "reasons" | "analytics";
export type TimelineGranularity = "hour" | "day" | "week";
export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export type VoteDistributionItem = {
  optionId: number;
  optionText: string;
  voteCount: number;
  percentage: number;
};

export type VoteTimelinePoint = {
  period: string;
  label: string;
  voteCount: number;
};

export type DemographicCoverage = {
  knownCount: number;
  totalCount: number;
  coveragePercentage: number;
};

export type AudienceItem = { label: string; count: number; percentage: number };
export type AgeOptionItem = { optionId: number; optionText: string };
export type AgeGroupItem = {
  ageGroup: string;
  label: string;
  totalVotes: number;
  optionVotes: Array<{ optionId: number; voteCount: number }>;
};
export type LocationGroupItem = {
  countryCode: string;
  label: string;
  totalVotes: number;
  optionVotes: Array<{ optionId: number; voteCount: number; percentage: number }>;
};
export type DeviceGroupItem = {
  deviceType: string;
  label: string;
  totalVotes: number;
  optionVotes: Array<{ optionId: number; voteCount: number; percentage: number }>;
};

export type PollInsight = {
  summary: string;
  optionSummaries: Array<{ optionId: number; summary: string; keyThemes: string[] }>;
  keyThemes: Array<{ theme: string; mentions: number }>;
  interestingFacts: Array<{
    type: "vote" | "time" | "location" | "device" | "age" | "reason";
    text: string;
    confidence: "high" | "medium" | "low";
  }>;
  reasonsAnalyzed: number;
  votesAtGeneration: number;
  modelName: string | null;
  generatedAt: string;
};

export type PollAnalytics = {
  overview: {
    totalVotes: number;
    views: number;
    uniqueViews: number;
    reasons: number;
    reactions: number;
    createdAt: string;
    duration: string;
  };
  voteDistribution: VoteDistributionItem[];
  timeline: { granularity: TimelineGranularity; points: VoteTimelinePoint[] };
  audience: {
    age: {
      groups: AgeGroupItem[];
      options: AgeOptionItem[];
      coverage: DemographicCoverage;
      isPrivate: boolean;
    };
    locations: {
      groups: LocationGroupItem[];
      options: AgeOptionItem[];
    };
    devices: {
      groups: DeviceGroupItem[];
      options: AgeOptionItem[];
    };
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    analyzedReasons: number;
    totalReasons: number;
  };
  insights: PollInsight | null;
  facts: Array<{ text: string; type: string }>;
  aiEnabled: boolean;
  aiConfigured: boolean;
  aiEligible: boolean;
};

export type AnalyticsEventContext = {
  sessionId: string | null;
  countryCode: string | null;
  deviceType: DeviceType;
  operatingSystem: string | null;
};
