import { getToken } from "./token";

export const API_URL = "https://www.clubhouseapi.com/api";
const API_BUILD_ID = "304";
const API_BUILD_VERSION = "0.1.28";
const API_UA = `clubhouse/${API_BUILD_ID} (iPhone; iOS 14.4; Scale/2.00)`;

export const HEADERS = {
  "CH-Languages": "en-JP,ja-JP",
  "CH-Locale": "en_JP",
  Accept: "application/json",
  "Accept-Language": "en-JP;q=1, ja-JP;q=0.9",
  "Accept-Encoding": "gzip, deflate",
  "CH-AppBuild": API_BUILD_ID,
  "CH-AppVersion": API_BUILD_VERSION,
  "User-Agent": API_UA,
  Connection: "close",
  "Content-Type": "application/json; charset=utf-8",
  Host: "www.clubhouseapi.com",
  // "Cookie": __cfduid={secrets.token_hex(21)}{random.randint(1, 9)}
};

interface Opts {
  method?: "GET" | "POST";
  body?: object;
}

const req = (path: string, opts?: Opts) => {
  if (getToken()) {
    // @ts-ignore
    HEADERS["Authorization"] = `Token ${getToken()}`;
  }
  return fetch(API_URL + path, {
    method: opts?.method ?? "GET",
    headers: HEADERS,
    body: opts?.body ? JSON.stringify(opts?.body) : undefined,
  });
};

export default req;
