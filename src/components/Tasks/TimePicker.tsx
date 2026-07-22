"use client";

import * as React from "react";
import { ClockIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcnui/select";
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

const to12Hour = (value: string) => {
  if (!value) return { hour: "", minute: "", period: "" };
  const [h, m] = value.split(":");
  const hour = parseInt(h, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 =
    hour === 0 ? 12
    : hour > 12 ? hour - 12
    : hour;
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
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 text-left font-normal",
              !value && "text-muted-foreground",
            )}>
            <ClockIcon className="size-4" />
            {value ? formatDisplay(value) : <span>Pick time</span>}
          </Button>
        }
      />
      <PopoverContent
        className="w-auto p-3"
        align="start">
        <div className="flex items-center gap-2">
          <Select
            value={hour}
            onValueChange={(v) => {
              if (!v) return;
              handleHourChange(v);
              if (!value) setOpen(false);
            }}>
            <SelectTrigger className="w-16">
              <SelectValue placeholder="--" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((h) => (
                <SelectItem
                  key={h.value}
                  value={h.value}>
                  {h.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-muted-foreground text-lg font-medium">:</span>

          <Select
            value={minute}
            onValueChange={(v) => {
              if (!v) return;
              handleMinuteChange(v);
              if (!value) setOpen(false);
            }}>
            <SelectTrigger className="w-16">
              <SelectValue placeholder="--" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((m) => (
                <SelectItem
                  key={m.value}
                  value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-col gap-0.5">
            <Button
              size="sm"
              variant={period === "AM" ? "default" : "ghost"}
              onClick={() => handlePeriodChange("AM")}
              className="h-6 min-w-10 px-2 text-xs">
              AM
            </Button>
            <Button
              size="sm"
              variant={period === "PM" ? "default" : "ghost"}
              onClick={() => handlePeriodChange("PM")}
              className="h-6 min-w-10 px-2 text-xs">
              PM
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;
