"use client";

import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { hasAuthToken } from "@/lib/api/client";
import { usePeriod } from "@/hooks/use-period";
import { useStandUi } from "@/stores/use-stand";

interface ModulePageProps<T extends { id: string }> {
  title: string;
  description?: string;
  queryKey: string[];
  fetchFn: () => Promise<T[]>;
  createFn?: (data: Record<string, unknown>) => Promise<T>;
  columns: DataTableColumn<T>[];
  entityLabel?: string;
  searchKeys?: (keyof T)[];
}

export function ModulePage<T extends { id: string }>({
  title,
  description,
  queryKey,
  fetchFn,
  createFn,
  columns,
  entityLabel = "item",
  searchKeys,
}: ModulePageProps<T>) {
  const moduleKey = queryKey.join("-");
  const search = useStandUi((s) => s.moduleSearch[moduleKey] ?? "");
  const setModuleSearch = useStandUi((s) => s.setModuleSearch);
  const dialogOpen = useStandUi((s) => s.moduleDialogOpen[moduleKey] ?? false);
  const setModuleDialogOpen = useStandUi((s) => s.setModuleDialogOpen);
  const { query: periodQuery } = usePeriod();
  const authenticated = hasAuthToken();
  const periodKey = useMemo(
    () => periodQuery,
    [periodQuery.period, periodQuery.startDate, periodQuery.endDate],
  );

  const { data, isLoading, isError } = useStandData(
    [...queryKey, periodKey, authenticated],
    fetchFn,
    { enabled: authenticated },
  );
  const rows = data ?? [];

  const createMutation = useStandMutation(
    (payload: Record<string, unknown>) => {
      if (!createFn) {
        return Promise.reject(new Error("Create not configured"));
      }
      return createFn(payload);
    },
    {
      onSuccess: () => {
        setModuleDialogOpen(moduleKey, false);
        toast.success(`${entityLabel} created`);
      },
      onError: () => toast.error(`Failed to create ${entityLabel}`),
    },
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) => {
      if (searchKeys?.length) {
        return searchKeys.some((key) => {
          const val = row[key];
          return String(val ?? "")
            .toLowerCase()
            .includes(q);
        });
      }
      return JSON.stringify(row).toLowerCase().includes(q);
    });
  }, [rows, search, searchKeys]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {createFn && (
            <Button size="sm" onClick={() => setModuleDialogOpen(moduleKey, true)}>
              <Plus className="size-4" />
              Add {entityLabel}
            </Button>
          )}
        </div>
      </div>

      {!authenticated && (
        <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to load {title.toLowerCase()} from the API.
          </p>
        </div>
      )}

      {authenticated && isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load data. Ensure the backend is running at{" "}
          {process.env.NEXT_PUBLIC_API_URL}.
        </div>
      )}

      {authenticated && (
        <DataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          emptyMessage={`No ${entityLabel}s yet. Create your first one.`}
          searchPlaceholder={`Search ${entityLabel}s...`}
          searchValue={search}
          onSearchChange={(v) => setModuleSearch(moduleKey, v)}
          getRowId={(row) => row.id}
        />
      )}

      {createFn && (
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => setModuleDialogOpen(moduleKey, open)}
        >
          <DialogContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const titleVal = String(fd.get("title") ?? "").trim();
                if (!titleVal) {
                  toast.error("Title is required");
                  return;
                }
                createMutation.mutate({
                  title: titleVal,
                  description: String(fd.get("notes") ?? "").trim() || undefined,
                });
              }}
            >
              <DialogHeader>
                <DialogTitle>Add {entityLabel}</DialogTitle>
                <DialogDescription>
                  Saved to your account and synced in real time.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="module-title">Title</Label>
                  <Input
                    id="module-title"
                    name="title"
                    placeholder={`${entityLabel} title`}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="module-notes">Notes</Label>
                  <Textarea
                    id="module-notes"
                    name="notes"
                    placeholder="Optional details..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModuleDialogOpen(moduleKey, false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
