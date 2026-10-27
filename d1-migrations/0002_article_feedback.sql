CREATE TABLE IF NOT EXISTS article_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_hash TEXT NOT NULL,
    vote TEXT NOT NULL CHECK (vote IN ('yes', 'no')),
    reason TEXT CHECK (reason IN ('clear', 'actionable', 'evidence', 'complete', 'unclear', 'missing_detail', 'outdated', 'hard_to_follow')),
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_hash)
);

CREATE INDEX IF NOT EXISTS article_feedback_post_vote_idx ON article_feedback (post_id, vote);
CREATE INDEX IF NOT EXISTS article_feedback_post_reason_idx ON article_feedback (post_id, reason) WHERE reason IS NOT NULL;
