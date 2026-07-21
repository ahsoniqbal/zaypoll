-- Run this migration once against the database configured by DB_NAME.

ALTER TABLE users
  ADD COLUMN email_verified TIMESTAMP NULL DEFAULT NULL AFTER email;

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
  CONSTRAINT fk_accounts_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
