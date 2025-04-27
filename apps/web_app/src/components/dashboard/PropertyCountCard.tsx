"use client";

import { cn } from "@/lib/utils";

type PropertyCountCardProps = {
  title: string;
  count: number;
  bgColor: string;
};

export const PropertyCountCard = ({ title, count, bgColor }: PropertyCountCardProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-4 text-white", bgColor)}>
      <span className="text-base lg:text-lg font-medium">{title}</span>
      <span className="text-xl lg:text-3xl font-bold">{count}</span>
    </div>
  );
};
