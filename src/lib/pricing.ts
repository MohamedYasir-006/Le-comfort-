// All date math is done on UTC calendar days so results are identical
// regardless of the server's local timezone. Dates are stored in UTC
// and displayed in IST (Asia/Kolkata) at the presentation layer.

const DAY_MS = 86_400_000;

function utcDayStart(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export type RateRule = {
  startDate: Date;
  endDate: Date;
  pricePerNight: number;
  minStayNights?: number | null;
};

export type PriceBreakdown = {
  nights: number;
  nightly: { date: string; price: number; isWeekend: boolean; seasonal: boolean }[];
  subtotal: number;
  total: number;
};

// Placeholder tax/fee logic: none applied unless the client specifies real ones.
export function priceForStay(opts: {
  checkIn: Date;
  checkOut: Date;
  base: number;
  weekend?: number | null;
  seasonal?: RateRule[];
}): PriceBreakdown {
  const { checkIn, checkOut, base, weekend, seasonal = [] } = opts;
  const nights = Math.round((utcDayStart(checkOut) - utcDayStart(checkIn)) / DAY_MS);
  if (nights <= 0) return { nights: 0, nightly: [], subtotal: 0, total: 0 };
  const start = utcDayStart(checkIn);
  const nightly = Array.from({ length: nights }, (_, k) => {
    const dayMs = start + k * DAY_MS;
    const d = new Date(dayMs);
    const dow = d.getUTCDay(); // 0 = Sun, 6 = Sat
    const wknd = dow === 0 || dow === 5 || dow === 6; // Fri–Sun weekend (South-India leisure pattern)
    const season = seasonal.find((s) => dayMs >= utcDayStart(s.startDate) && dayMs <= utcDayStart(s.endDate));
    const price = season ? season.pricePerNight : wknd && weekend ? weekend : base;
    return {
      date: d.toISOString().slice(0, 10),
      price,
      isWeekend: wknd,
      seasonal: !!season,
    };
  });
  const subtotal = nightly.reduce((a, n) => a + n.price, 0);
  return { nights, nightly, subtotal, total: subtotal };
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.round((utcDayStart(b) - utcDayStart(a)) / DAY_MS);
}

// Availability rule (mirrors server): unavailable if inside any
// pending/confirmed booking [checkIn, checkOut) or a BlockedDate.
export function isDateBlocked(
  isoDate: string, // yyyy-mm-dd
  bookings: { checkIn: string; checkOut: string }[],
  blocked: string[],
): boolean {
  if (blocked.includes(isoDate)) return true;
  const t = new Date(isoDate + "T00:00:00Z").getTime();
  return bookings.some((b) => {
    const s = new Date(b.checkIn).getTime();
    const e = new Date(b.checkOut).getTime();
    return t >= s && t < e;
  });
}
