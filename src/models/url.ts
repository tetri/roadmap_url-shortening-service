export interface UrlRecord {
  id: number;
  url: string;
  short_code: string;
  access_count: number;
  created_at: string;
  updated_at: string;
}

export interface UrlResponse {
  id: string;
  url: string;
  shortCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface UrlStatsResponse extends UrlResponse {
  accessCount: number;
}

export function toUrlResponse(record: UrlRecord): UrlResponse {
  return {
    id: String(record.id),
    url: record.url,
    shortCode: record.short_code,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function toUrlStatsResponse(record: UrlRecord): UrlStatsResponse {
  return {
    ...toUrlResponse(record),
    accessCount: record.access_count,
  };
}
