import Cookies from "universal-cookie";
import { IncomingMessage } from "http";

export function splitCookies(cookies: string) {
  console.log(cookies);
  const map = new Map();

  const cookieJar = cookies.split("; ");

  for (const val of cookieJar) {
    const parts = val.split("=");
    map.set(parts[0], parts[1]);
  }

  const results: { [key: string]: string } = {};

  map.forEach((value, key) => {
    results[key] = value;
  });

  return results;
}

export function getToken(req?: IncomingMessage): string {
  let cookies;
  if (req) {
    cookies = new Cookies(req.headers.cookie);
  } else {
    cookies = new Cookies();
  }

  const { DW_TOKEN } = cookies.getAll();

  return DW_TOKEN;
}
