-- Add optional profile completion fields to the existing users table.
-- Run this migration after 001_poll_analytics.sql, which adds age_group.

ALTER TABLE users
  ADD COLUMN gender ENUM(
    'woman', 'man', 'non_binary', 'prefer_not_to_say'
  ) NULL AFTER age_group,
  ADD COLUMN profile_onboarding_prompted_at TIMESTAMP NULL DEFAULT NULL AFTER gender,
  ADD COLUMN profile_onboarding_dismissed_at TIMESTAMP NULL DEFAULT NULL
    AFTER profile_onboarding_prompted_at;
