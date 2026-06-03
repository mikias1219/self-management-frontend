"use client";

import { ModulePage } from "@/components/modules/module-page";
import { aiCoachApi } from "@/lib/api";
import { aiCoachColumns } from "@/lib/module-columns";

export default function AiCoachPage() {
  return (
    <ModulePage
      title="AI Coach"
      description="Guided coaching sessions and conversations."
      queryKey={["ai-coach"]}
      fetchFn={() => aiCoachApi.getAll()}
      createFn={(data) =>
        aiCoachApi.create({
          title: String(data.title),
          context: data.description ? String(data.description) : undefined,
        })
      }
      columns={aiCoachColumns}
      entityLabel="session"
      searchKeys={["title"]}
    />
  );
}
