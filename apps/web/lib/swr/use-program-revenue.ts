import { fetcher } from "@dub/utils";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { DUB_PARTNERS_ANALYTICS_INTERVAL } from "../analytics/constants";
import { PartnerAnalyticsFilters } from "../analytics/types";
import useWorkspace from "./use-workspace";

interface Revenue {
  start: string;
  saleAmount: number;
}

export default function useProgramRevenue(
  params?: PartnerAnalyticsFilters & { enabled: boolean },
) {
  const { programId } = useParams();
  const { id: workspaceId } = useWorkspace();

  const searchParams = new URLSearchParams({
    event: params?.event ?? "composite",
    ...(params?.start && params?.end
      ? {
          start: typeof params.start === "string" ? params.start : params.start.toISOString(),
          end: typeof params.end === "string" ? params.end : params.end.toISOString(),
        }
      : { interval: params?.interval ?? DUB_PARTNERS_ANALYTICS_INTERVAL }),
    groupBy: params?.groupBy ?? "count",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    workspaceId: workspaceId!,
  });

  const { data, error } = useSWR<Revenue[]>(
    params?.enabled
      ? `/api/programs/${programId}/revenue?${searchParams.toString()}`
      : null,
    fetcher,
    {
      dedupingInterval: 60000,
    },
  );

  return {
    data,
    error,
    loading: programId && !data && !error ? true : false,
  };
}
