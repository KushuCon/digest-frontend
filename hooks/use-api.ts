"use client";
import useSWR, { type SWRConfiguration } from "swr";

const fetcher = async (url: string) => {
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
};

export function useApi<T>(key: string | null, opts?: SWRConfiguration) {
  return useSWR<T>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 15_000,
    ...opts,
  });
}
