import "server-only";

export function areAiInsightsEnabled() {
  return process.env.AI_INSIGHTS_ENABLED === "true";
}
