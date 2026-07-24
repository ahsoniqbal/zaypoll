-- ZayPoll poll analytics migration (MySQL 8.1)
-- Apply manually after taking a database backup. The application remains usable
-- for historical polls; event-backed metrics begin accumulating after migration.

ALTER TABLE users
  ADD COLUMN age_group ENUM(
    'under_18', '18_24', '25_34', '35_44', '45_54', '55_plus'
  ) NULL;

CREATE TABLE poll_events (
  id BIGINT NOT NULL AUTO_INCREMENT,
  poll_id BIGINT NOT NULL,
  user_id BIGINT NULL,
  session_id VARCHAR(100) NULL,
  event_type ENUM('VIEW', 'VOTE', 'REASON_ADDED', 'REACTION', 'SHARE') NOT NULL,
  option_id BIGINT NULL,
  country_code CHAR(2) NULL,
  device_type ENUM('mobile', 'tablet', 'desktop', 'unknown') NOT NULL DEFAULT 'unknown',
  operating_system VARCHAR(30) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_poll_events_poll_type_created (poll_id, event_type, created_at),
  INDEX idx_poll_events_user (user_id),
  INDEX idx_poll_events_session (poll_id, session_id),
  CONSTRAINT fk_poll_events_poll FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  CONSTRAINT fk_poll_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_poll_events_option FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE SET NULL
);

CREATE TABLE reason_ai_analysis (
  reason_id BIGINT NOT NULL,
  sentiment ENUM('positive', 'neutral', 'negative') NOT NULL,
  sentiment_score DECIMAL(5,4) NULL,
  themes JSON NULL,
  model_name VARCHAR(100) NULL,
  analyzed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (reason_id),
  CONSTRAINT fk_reason_ai_analysis_reason FOREIGN KEY (reason_id) REFERENCES option_comments(id) ON DELETE CASCADE
);

CREATE TABLE poll_ai_insights (
  poll_id BIGINT NOT NULL,
  summary TEXT NOT NULL,
  option_summaries JSON NULL,
  key_themes JSON NULL,
  interesting_facts JSON NULL,
  reasons_analyzed INT NOT NULL DEFAULT 0,
  votes_at_generation BIGINT NOT NULL DEFAULT 0,
  model_name VARCHAR(100) NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (poll_id),
  CONSTRAINT fk_poll_ai_insights_poll FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

CREATE INDEX idx_poll_votes_poll_created ON poll_votes (poll_id, created_at);
CREATE INDEX idx_poll_votes_poll_user ON poll_votes (poll_id, user_id);
CREATE INDEX idx_reason_analysis_sentiment ON reason_ai_analysis (sentiment);
