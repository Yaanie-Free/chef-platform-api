"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "./utils";
import { buttonVariants } from "./button";

function toLocalDate(date) {
  // Normalize to local midnight to avoid TZ off-by-one
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function Calendar({ className, classNames, showOutsideDays = true, selected, onSelect, ...props }) {
  const handleSelect = React.useCallback(
    (value) => {
      if (!value) return onSelect?.(value);
      if (Array.isArray(value)) {
        onSelect?.(value.map(toLocalDate));
      } else if (value?.from || value?.to) {
        onSelect?.({ from: value.from ? toLocalDate(value.from) : undefined, to: value.to ? toLocalDate(value.to) : undefined });
      } else {
        onSelect?.(toLocalDate(value));
      }
    },
    [onSelect]
  );

  const normalizedSelected = React.useMemo(() => {
    if (!selected) return selected;
    if (Array.isArray(selected)) return selected.map(toLocalDate);
    if (selected?.from || selected?.to)
      return {
        from: selected.from ? toLocalDate(selected.from) : undefined,
        to: selected.to ? toLocalDate(selected.to) : undefined,
      };
    return toLocalDate(selected);
  }, [selected]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      selected={normalizedSelected}
      onSelect={handleSelect}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(buttonVariants({ variant: "ghost" }), "size-8 p-0 font-normal aria-selected:opacity-100"),
        day_range_start: "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end: "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "ring-1 ring-primary/40 rounded-md",
        day_outside: "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...p }) => <ChevronLeft className={cn("size-4", className)} {...p} />,
        IconRight: ({ className, ...p }) => <ChevronRight className={cn("size-4", className)} {...p} />,
      }}
      {...props}
    />
  );
}
