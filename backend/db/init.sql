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

-- 더미 데이터 1건 삽입 (중복 방지)
INSERT INTO news (
    id, title, summary, content, thumbnail, published_at, source, sentiment, tags, url
)
SELECT
    'dummy-1',
    'Ethereum – How an 8% supply squeeze is pushing ETH towards price discovery',
    'How does 8% of ETH in institutional reserves impact the market?',
    'Full content for the Ethereum supply squeeze article goes here.',
    'https://images.cryptocompare.com/news/default/ambcrypto.png',
    NOW(),
    'ambcrypto',
    'neutral',
    ARRAY['Ethereum','News','Market'],
    'https://ambcrypto.com/ethereum-how-an-8-supply-squeeze-is-pushing-eth-towards-price-discovery/'
WHERE NOT EXISTS (
    SELECT 1 FROM news WHERE id = 'dummy-1'
);