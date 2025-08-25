-- 확장 설치
CREATE EXTENSION IF NOT EXISTS vector;

-- 뉴스 테이블 생성 (id를 INTEGER로 변경)
CREATE TABLE IF NOT EXISTS news (
    id            INTEGER           PRIMARY KEY,
    title         TEXT              NOT NULL,
    summary       TEXT,
    content       TEXT,
    thumbnail     TEXT,
    published_at  TIMESTAMP,
    source        TEXT,
    sentiment     TEXT              CHECK (sentiment IN ('positive','negative','neutral')),
    tags          TEXT[],
    url           TEXT,
    embedding     VECTOR(768),
    views         BIGINT            DEFAULT 0,
    created_at    TIMESTAMP         DEFAULT CURRENT_TIMESTAMP
);