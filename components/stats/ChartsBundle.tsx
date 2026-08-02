"use client";

import dynamic from "next/dynamic";

// recharts is heavy — split it into its own lazy chunk, loaded after paint.
export const RatingChart = dynamic(
  () => import("@/components/stats/RatingChart").then((m) => m.RatingChart),
  { ssr: false, loading: () => <div className="h-72 animate-pulse bg-bg3" /> },
);

export const DistributionBars = dynamic(
  () =>
    import("@/components/stats/DistributionBars").then(
      (m) => m.DistributionBars,
    ),
  { ssr: false, loading: () => <div className="h-56 animate-pulse bg-bg3" /> },
);
