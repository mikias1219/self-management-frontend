"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function FormField({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  step,
  min,
  max,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  step?: string;
  min?: string;
  max?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
      />
    </div>
  );
}

export function FormTextarea({
  label,
  name,
  rows = 3,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  rows?: number;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue}
      />
    </div>
  );
}

export function FormSelect({
  label,
  name,
  options,
  defaultValue,
  required,
  onChange,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        onChange={onChange}
        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
