"use client";

import { financeApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { usePeriod } from "@/hooks/use-period";
import { useStandData } from "@/hooks/use-stand-data";
import { formatMoney } from "@/lib/utils/period";
import { StatCard } from "@/components/shared/stat-card";
import { DollarSign } from "lucide-react";

export function FinancialSnapshot() {
  const authenticated = hasAuthToken();
  const { query } = usePeriod();

  const { data, isLoading } = useStandData(
    ["finance", "summary", query],
    () => financeApi.getSummary(query),
    { enabled: authenticated },
  );

  return (
    <StatCard
      title="Finance"
      value={formatMoney(data?.totals.netWorth ?? 0)}
      description={
        authenticated
          ? `${formatMoney(data?.totals.netCashFlow ?? 0)} net · ${data?.totals.savingsRate ?? 0}% saved`
          : undefined
      }
      icon={DollarSign}
      loading={authenticated && isLoading}
    />
  );
}
