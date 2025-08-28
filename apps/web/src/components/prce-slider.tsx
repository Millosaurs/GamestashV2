"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type PriceSliderProps = {
  min: number;
  max: number;
  value: [number, number];
  onValueChange: (next: [number, number]) => void;
  onApply?: (next: [number, number]) => void;
};

export default function PriceSlider({
  min,
  max,
  value,
  onValueChange,
  onApply,
}: PriceSliderProps) {
  const formatPrice = (price: number) => {
    return price === max
      ? `$${price.toLocaleString()}+`
      : `$${price.toLocaleString()}`;
  };

  return (
    <div className="*:not-first:mt-3">
      <Label className="tabular-nums">
        From {formatPrice(value[0])} to {formatPrice(value[1])}
      </Label>
      <div className="flex items-center gap-4">
        <Slider
          value={value}
          onValueChange={(v) => onValueChange([v[0], v[1]])}
          min={min}
          max={max}
          aria-label="Price range slider"
        />
        {onApply && (
          <Button variant="outline" onClick={() => onApply(value)}>
            Go
          </Button>
        )}
      </div>
    </div>
  );
}
