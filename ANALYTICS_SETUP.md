# Poll analytics setup

1. Back up the MySQL database and apply `migrations/001_poll_analytics.sql`.
2. Add these server-only environment variables to `.env.local` or the deployment environment:

   ```env
   GEMINI_API_KEY=your_google_ai_studio_key
   GEMINI_MODEL=gemini-3.6-flash
   ```

   `GEMINI_MODEL` is optional. Never expose either value through a `NEXT_PUBLIC_` variable.
3. Restart the Next.js process after changing environment variables.

For local country analytics testing only, you may also set a two-character
country code. This override is ignored automatically in production:

```env
ANALYTICS_DEV_COUNTRY_CODE=PK
```

## Privacy notes

- Poll events store country codes from trusted platform headers, normalized device categories, and an opaque HTTP-only session ID.
- Raw IP addresses and full user-agent strings are not stored.
- Age ranges are optional and suppressed until at least ten voters provide one.
- Gemini receives truncated reason text without names, email addresses, location, device, IP, or session data. User text is delimited and treated as untrusted.
- View events are deduplicated per authenticated user or anonymous session for 30 minutes.
- Event collection is isolated behind the poll event service so a future consent preference can disable it centrally.

## Manual test checklist

- Open a poll: Reasons is selected by default; `?tab=analytics` opens Analytics directly.
- Switch tabs, refresh, and use browser Back/Forward; the active tab follows the URL.
- Confirm repeated refreshes within 30 minutes create only one view for that user/session.
- Vote successfully and confirm the vote and `VOTE` event commit together; force a vote failure and confirm neither analytics nor counters change.
- Compare overview, option distribution, reaction, and reason totals to MySQL.
- Check zero-vote, new, 2–60 day, and older-than-60-day poll timelines.
- Confirm missing timeline intervals display as zero and charts resize without horizontal overflow.
- Confirm only two-character country codes and normalized devices are persisted.
- Confirm the age breakdown is hidden below ten known age ranges.
- Confirm historical polls work without event backfill and audience cards show empty states.
- Add short and meaningful reasons; short reasons must not be sent to Gemini.
- Remove `GEMINI_API_KEY` and confirm the Analytics tab shows a graceful unavailable state.
- Confirm a summary is persisted only after 10 votes and 5 meaningful reasons and is not regenerated on page load.
- Test keyboard navigation through tabs and verify visible text equivalents exist for charts.

## Known limitations

- Historical views, countries, and devices cannot be reconstructed and intentionally are not backfilled.
- Country accuracy depends on trusted deployment headers (`x-vercel-ip-country` or `cf-ipcountry`).
- Background AI analysis initiated after adding a reason is best-effort; production deployments may move it to a durable job queue.
- Age analytics reflect only users who voluntarily save an age range on their own profile.
