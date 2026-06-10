"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { BookOpen, ListChecks, Plus, Receipt, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStandData } from "@/hooks/use-stand-data";
import { financeApi } from "@/lib/api/finance";
import { hasAuthToken } from "@/lib/api/client";

const QuickAddTransactionDialog = dynamic(
  () =>
    import("@/components/finance/quick-add-transaction-dialog").then((m) => ({
      default: m.QuickAddTransactionDialog,
    })),
  { ssr: false },
);

export function GlobalQuickAdd() {
  const router = useRouter();
  const authenticated = hasAuthToken();
  const [expenseOpen, setExpenseOpen] = useState(false);

  const { data: expenseCats = [] } = useStandData(
    ["finance", "expense-categories", "quick-add"],
    () => financeApi.expenseCategories.getAll(),
    { enabled: authenticated && expenseOpen, staleTime: 300_000 },
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon-sm"
              className="rounded-full"
              aria-label="Quick add"
            >
              <Plus className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => router.push("/productivity?tab=tasks")}
          >
            <ListChecks className="size-4" />
            Add task
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExpenseOpen(true)}>
            <Receipt className="size-4" />
            Log expense
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/productivity?tab=habits")}
          >
            <Sparkles className="size-4" />
            Log habit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/life?tab=journal")}>
            <BookOpen className="size-4" />
            Journal entry
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <QuickAddTransactionDialog
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        expenseCats={expenseCats}
      />
    </>
  );
}
