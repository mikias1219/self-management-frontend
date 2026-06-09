"use client";

import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField, FormSelect } from "@/components/shared/form-fields";
import { useStandMutation } from "@/hooks/use-stand-data";
import { financeApi } from "@/lib/api/finance";
import type { ExpenseCategory, TransactionType } from "@/lib/types";

const TX_TYPES: TransactionType[] = ["income", "expense", "transfer"];

interface QuickAddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseCats: ExpenseCategory[];
  onSuccess?: () => void;
}

export function QuickAddTransactionDialog({
  open,
  onOpenChange,
  expenseCats,
  onSuccess,
}: QuickAddTransactionDialogProps) {
  const [type, setType] = useState<TransactionType>("expense");

  const create = useStandMutation(
    (data: {
      amount: number;
      transactionType: TransactionType;
      categoryId?: string;
      description?: string;
      transactionDate?: string;
    }) => financeApi.transactions.createSimple(data),
    {
      invalidateKeys: [["finance"]],
      onSuccess: () => {
        toast.success("Transaction saved");
        onOpenChange(false);
        onSuccess?.();
      },
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick add</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const amount = Number(fd.get("amount"));
            if (!amount || amount <= 0) {
              toast.error("Enter a valid amount");
              return;
            }
            create.mutate({
              amount,
              transactionType: type,
              categoryId: String(fd.get("categoryId") || "") || undefined,
              description: String(fd.get("description") || "").trim() || undefined,
              transactionDate:
                String(fd.get("transactionDate") || "") ||
                format(new Date(), "yyyy-MM-dd"),
            });
          }}
        >
          <FormField
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            required
          />
          <div className="flex gap-2">
            {TX_TYPES.map((t) => (
              <Button
                key={t}
                type="button"
                variant={type === t ? "default" : "outline"}
                className="flex-1 capitalize"
                onClick={() => setType(t)}
              >
                {t}
              </Button>
            ))}
          </div>
          <FormSelect
            label="Category"
            name="categoryId"
            options={[
              { value: "", label: "Select category" },
              ...expenseCats.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <FormField
            label="Note"
            name="description"
            placeholder="Optional"
          />
          <FormField
            label="Date"
            name="transactionDate"
            type="date"
            defaultValue={format(new Date(), "yyyy-MM-dd")}
          />
          <DialogFooter>
            <Button type="submit" disabled={create.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
