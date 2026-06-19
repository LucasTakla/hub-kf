"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchMarketingOverview,
  mapDateRangeToApi,
  type MarketingOverviewResponse,
} from "@/lib/marketing/api";
import type { DateRange } from "@/lib/marketing/types";

export function useMarketingOverview(range: DateRange = "30d") {
  const [data, setData] = useState<MarketingOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await fetchMarketingOverview(range);
      setData(overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load marketing data");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    apiRange: mapDateRangeToApi(range),
  };
}
