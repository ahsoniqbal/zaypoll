CREATE DATABASE IF NOT EXISTS next_app;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified TIMESTAMP NULL DEFAULT NULL,
    user_name VARCHAR(255) NOT NULL UNIQUE,
    image TEXT NULL,
    UNIQUE KEY uq_username (user_name),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type VARCHAR(32) NOT NULL,
  provider VARCHAR(191) NOT NULL,
  provider_account_id VARCHAR(191) NOT NULL,
  refresh_token TEXT NULL,
  access_token TEXT NULL,
  expires_at BIGINT NULL,
  token_type VARCHAR(64) NULL,
  scope TEXT NULL,
  id_token TEXT NULL,
  session_state VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_accounts_provider (provider, provider_account_id),
  INDEX idx_accounts_user_id (user_id),
  CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token),
  INDEX idx_verification_tokens_expires (expires)
);

CREATE TABLE auth_rate_limits (
  identifier_hash CHAR(64) NOT NULL,
  window_start DATETIME(3) NOT NULL,
  request_count INT UNSIGNED NOT NULL DEFAULT 1,
  expires_at DATETIME(3) NOT NULL,
  PRIMARY KEY (identifier_hash, window_start),
  INDEX idx_auth_rate_limits_expires (expires_at)
);


CREATE TABLE polls (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    total_votes BIGINT DEFAULT 0,
    upvotes BIGINT DEFAULT 0,
    downvotes BIGINT DEFAULT 0,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_polls_created_by (created_by),
    INDEX idx_polls_created_at (created_at)
);

ALTER TABLE polls ADD FULLTEXT(title, content);
-- ALTER TABLE polls ADD FULLTEXT(title, content) WITH PARSER ngram;

CREATE TABLE poll_options (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  option_text VARCHAR(255) NOT NULL,
  poll_id BIGINT NOT NULL,
  vote_count BIGINT DEFAULT 0,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  INDEX idx_poll_options_poll_id (poll_id),
  UNIQUE KEY unique_poll_option (poll_id, option_text)
);

CREATE TABLE poll_votes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  poll_id BIGINT NOT NULL,
  option_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  UNIQUE KEY unique_user_vote (poll_id, user_id)
);


CREATE TABLE option_comments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  option_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  comment TEXT NOT NULL,
  upvotes BIGINT DEFAULT 0,
  downvotes BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (option_id) REFERENCES poll_options(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE poll_reactions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  poll_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  vote TINYINT NOT NULL, -- +1 or -1
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_poll_user (poll_id, user_id),

  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comment_reactions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  comment_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  vote TINYINT NOT NULL, -- +1 (upvote) or -1 (downvote)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_comment_user (comment_id, user_id),

  FOREIGN KEY (comment_id) REFERENCES option_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_comment_reactions_comment (comment_id),
  INDEX idx_comment_reactions_user (user_id)
);

ALTER TABLE option_comments
ADD COLUMN upvotes BIGINT DEFAULT 0,
ADD COLUMN downvotes BIGINT DEFAULT 0;


CREATE TABLE user_follows (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  follower_id BIGINT NOT NULL,   -- who follows
  following_id BIGINT NOT NULL,  -- who is being followed

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_follow (follower_id, following_id),

  INDEX idx_follower_id (follower_id),
  INDEX idx_following_id (following_id),

  CONSTRAINT fk_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);


ALTER TABLE users
ADD followers_count BIGINT DEFAULT 0,
ADD following_count BIGINT DEFAULT 0;


CREATE INDEX idx_user_follows_lookup
ON user_follows(following_id, follower_id);



-- If your app goes live:
-- Run a one-time sync script (in case of mismatch):

UPDATE users u
SET followers_count = (
  SELECT COUNT(*) FROM user_follows f
  WHERE f.following_id = u.id
),
following_count = (
  SELECT COUNT(*) FROM user_follows f
  WHERE f.follower_id = u.id
);

//-------------------------------------------------------

CREATE TABLE topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    parent_id BIGINT NULL,
    icon_url VARCHAR(255) NULL,
    is_trending BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE topics ADD CONSTRAINT chk_topics_not_own_parent CHECK (parent_id IS NULL OR parent_id <> id);
ALTER TABLE topics ADD INDEX idx_topics_parent_active_name (parent_id, is_active, name);
ALTER TABLE topics ADD INDEX idx_topics_active_trending_name (is_active, is_trending, name);

ALTER TABLE topics
ADD CONSTRAINT fk_topics_parent
FOREIGN KEY (parent_id)
REFERENCES topics(id)
ON DELETE RESTRICT;

CREATE TABLE poll_topics (
    poll_id BIGINT NOT NULL,
    topic_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (poll_id, topic_id),

    INDEX idx_pt_topic_poll (topic_id, poll_id),

    CONSTRAINT fk_pt_poll
        FOREIGN KEY (poll_id)
        REFERENCES polls(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pt_topic
        FOREIGN KEY (topic_id)
        REFERENCES topics(id)
        ON DELETE CASCADE
);



CREATE INDEX idx_polls_created_by ON polls(created_by);
CREATE INDEX idx_option_comments_option_id ON option_comments(option_id);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);


CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    actor_user_id BIGINT NULL,
    type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    reference_id BIGINT NOT NULL,
    data JSON,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notifications_actor
        FOREIGN KEY (actor_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    INDEX idx_user_feed (user_id, is_read, created_at DESC, id DESC),
    INDEX idx_user_created (user_id,created_at DESC)
);
