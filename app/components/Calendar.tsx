"use client";

import { Input } from "@mui/joy";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

export default function Calendar({ value = "", onChange }: Props) {
  return (
    <Input
      type="date"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      sx={{
        fontSize: "13px",
        height: 40,
      }}
    />
  );
}
