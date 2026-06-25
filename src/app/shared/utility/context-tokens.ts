import { HttpContextToken } from "@angular/common/http";

export const IS_RETRY_ENABLED = new HttpContextToken<boolean>(() => false);
export const RETRY_COUNT = new HttpContextToken<number>(() => 1);

export const IS_CACHE_ENABLE = new HttpContextToken<boolean>(() => false);
export const CACHE_TIME_MS = new HttpContextToken<number>(() => 1000 * 60 * 10);