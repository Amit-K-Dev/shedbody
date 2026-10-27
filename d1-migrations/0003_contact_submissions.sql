CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK(length(name) >= 2 AND length(name) <= 80),
    email TEXT NOT NULL CHECK(length(email) >= 5 AND length(email) <= 255),
    inquiry_type TEXT NOT NULL,
    message TEXT NOT NULL CHECK(length(message) >= 10 AND length(message) <= 3000),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
