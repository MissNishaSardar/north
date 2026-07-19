"use client";

import * as React from "react";
import { ClockIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcnui/popover";
import { cn } from "@/lib/utils";

const hours = Array.from({ length: 12 }, (_, i) => {
  const v = String(i + 1);
  return { value: v.padStart(2, "0"), label: v };
});

const minutes = Array.from({ length: 12 }, (_, i) => ({
  value: String(i * 5).padStart(2, "0"),
  label: String(i * 5).padStart(2, "0"),
}));

const periods = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" },
];

const to12Hour = (value: string) => {
  if (!value) return { hour: "", minute: "", period: "" };
  const [h, m] = value.split(":");
  const hour = parseInt(h, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return {
    hour: String(hour12).padStart(2, "0"),
    minute: m,
    period,
  };
};

const to24Hour = (hour: string, minute: string, period: string) => {
  const h = parseInt(hour, 10);
  const m = parseInt(minute, 10);
  if (isNaN(h) || isNaN(m)) return "";
  let h24 = h;
  if (period === "PM" && h !== 12) h24 = h + 12;
  if (period === "AM" && h === 12) h24 = 0;
  return `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const formatDisplay = (value: string) => {
  if (!value) return "";
  const { hour, minute, period } = to12Hour(value);
  return `${parseInt(hour, 10)}:${minute} ${period}`;
};

type TimePickerProps = {
  value?: string;
  onChange: (value: string) => void;
};

const TimePicker = ({ value, onChange }: TimePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const { hour, minute, period } = to12Hour(value ?? "");

  const handleHourChange = (h: string) => {
    const result = to24Hour(h, minute || "00", period || "AM");
    if (result) onChange(result);
  };

  const handleMinuteChange = (m: string) => {
    const result = to24Hour(hour || "12", m, period || "AM");
    if (result) onChange(result);
  };

  const handlePeriodChange = (p: string) => {
    const result = to24Hour(hour || "12", minute || "00", p);
    if (result) onChange(result);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 text-left font-normal",
              !value && "text-muted-foreground",
            )}>
            <ClockIcon className="size-4" />
            {value ?
              formatDisplay(value)
            : <span>Pick time</span>}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-2">
        <div className="flex gap-1">
          <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
            {hours.map((h) => (
              <Button
                key={h.value}
                variant={hour === h.value ? "default" : "ghost"}
                size="sm"
                className="min-w-10 shrink-0"
                onClick={() => handleHourChange(h.value)}>
                {h.label}
              </Button>
            ))}
          </div>

          <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
            {minutes.map((m) => (
              <Button
                key={m.value}
                variant={minute === m.value ? "default" : "ghost"}
                size="sm"
                className="min-w-10 shrink-0"
                onClick={() => handleMinuteChange(m.value)}>
                {m.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-0.5">
            {periods.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? "default" : "ghost"}
                size="sm"
                className="min-w-14 shrink-0"
                onClick={() => handlePeriodChange(p.value)}>
                {p.label}
              </Button>
            ))}
          </div>
        </div>
        <Button
          className="mt-2 w-full"
          size="sm"
          onClick={() => setOpen(false)}>
          Set Time
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;
