CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    thumbnail TEXT,
    published_at TIMESTAMP,
    source TEXT,
    sentiment TEXT CHECK (sentiment IN ('positive','negative','neutral')),
    tags TEXT[],
    url TEXT,
    embedding VECTOR(768),
    views BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);