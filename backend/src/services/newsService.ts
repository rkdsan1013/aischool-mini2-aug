// /backend/src/services/newsService.ts

const CRYPTO_NEWS_API_URL =
  process.env.CRYPTO_NEWS_API_URL ||
  "https://min-api.cryptocompare.com/data/v2/news/?lang=EN";

export interface NewsItem {
  id: number;
  published_on: number;
  imageurl: string;
  title: string;
  url: string;
  body: string;
  tags: string;
  source_name: string;
}

/**
 * CryptoCompare API에서 뉴스 가져오기 + 필요한 필드만 추출
 */
export async function fetchCryptoNews(): Promise<NewsItem[]> {
  const response = await fetch(CRYPTO_NEWS_API_URL);
  if (!response.ok) {
    throw new Error(`뉴스 API 요청 실패: ${response.status}`);
  }

  const rawData = await response.json();

  if (!rawData?.Data || !Array.isArray(rawData.Data)) {
    return [];
  }

  return rawData.Data.map((item: any) => ({
    id: typeof item.id === "string" ? Number(item.id) : item.id,
    published_on: item.published_on,
    imageurl: item.imageurl,
    title: item.title,
    url: item.url,
    body: item.body,
    tags: item.tags,
    source_name: item.source_info?.name || "",
  }));
}
