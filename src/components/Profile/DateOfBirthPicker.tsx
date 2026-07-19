"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import { Calendar } from "@/components/shadcnui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcnui/popover";
import { cn } from "@/lib/utils";

type DateOfBirthPickerProps = {
  value?: string;
  onChange: (value: string) => void;
  id?: string;
};

const DateOfBirthPicker = ({
  value,
  onChange,
  id,
}: DateOfBirthPickerProps) => {
  const [open, setOpen] = React.useState(false);

  const date = React.useMemo(() => {
    if (!value) return undefined;
    const d = new Date(value + "T00:00:00");
    return isNaN(d.getTime()) ? undefined : d;
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 text-left font-normal",
              !date && "text-muted-foreground",
            )}>
            <CalendarIcon className="size-4" />
            {date ?
              format(date, "PPP")
            : <span>Pick date of birth</span>}
          </Button>
        }
      />
      <PopoverContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(
                2,
                "0",
              );
              const day = String(selectedDate.getDate()).padStart(2, "0");
              onChange(`${year}-${month}-${day}`);
            }
            setOpen(false);
          }}
          disabled={(d) => d > new Date() || d < new Date(1900, 0, 1)}
          captionLayout="dropdown"
          startMonth={new Date(1900, 0, 1)}
          endMonth={new Date()}
          defaultMonth={date ?? new Date(2000, 0, 1)}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateOfBirthPicker;
