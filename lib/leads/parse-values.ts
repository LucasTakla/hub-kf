export function parseLeadTime(value: string | undefined | null): {
  hours: number;
  minutes: number;
  seconds: number;
} | null {
  if (!value?.trim()) return null;

  const raw = value.trim();

  const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = Number(ampmMatch[2]);
    const seconds = Number(ampmMatch[3] ?? 0);
    const meridiem = ampmMatch[4].toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return { hours, minutes, seconds };
  }

  const h24Match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (h24Match) {
    return {
      hours: Number(h24Match[1]),
      minutes: Number(h24Match[2]),
      seconds: Number(h24Match[3] ?? 0),
    };
  }

  return null;
}

export function combineDateAndTime(
  date: Date | null,
  timeValue: string | null | undefined,
): Date | null {
  if (!date && !timeValue?.trim()) return null;

  if (!date && timeValue) {
    const parts = parseLeadTime(timeValue);
    if (!parts) return null;
    const fallback = new Date();
    fallback.setHours(parts.hours, parts.minutes, parts.seconds, 0);
    return fallback;
  }

  if (!date) return null;

  if (!timeValue?.trim()) return date;

  const parts = parseLeadTime(timeValue);
  if (!parts) return date;

  const combined = new Date(date);
  combined.setHours(parts.hours, parts.minutes, parts.seconds, 0);
  return combined;
}

export function formatLeadDate(timestamp: string | Date): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatLeadTime(timestamp: string | Date): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function parseLeadDate(value: string | undefined | null): Date | null {
  if (!value?.trim()) return null;

  const raw = value.trim();

  // YYYY-MM-DD or YYYY-MM-DD HH:mm:ss
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (isoMatch) {
    const [, year, month, day, hour = "0", minute = "0", second = "0"] = isoMatch;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    );
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // MM/DD/YYYY or M/D/YYYY with optional time
  const usMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (usMatch) {
    const [, month, day, year, hour = "0", minute = "0", second = "0"] = usMatch;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    );
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function parseMonthlyRevenue(value: string | undefined | null): number | null {
  if (!value?.trim()) return null;

  const normalized = value.trim().replace(/[$,\s]/g, "");
  if (!normalized) return null;

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function formatMonthlyRevenue(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
