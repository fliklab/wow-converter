import React from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

interface HelpTooltipProps {
  label: string;
  children: React.ReactNode;
  align?: "left" | "right";
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  label,
  children,
  align = "right",
}) => (
  <details className="group relative">
    <summary
      className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-text-secondary dark:hover:bg-gray-700 dark:hover:text-text-primary [&::-webkit-details-marker]:hidden"
      aria-label={label}
    >
      <QuestionMarkCircleIcon className="h-5 w-5" aria-hidden="true" />
    </summary>
    <div
      role="tooltip"
      className={`absolute bottom-full z-[1010] mb-2 hidden w-72 rounded-lg bg-gray-900 px-3 py-2 text-sm leading-6 text-white shadow-lg group-hover:block group-focus-within:block group-open:block dark:bg-gray-100 dark:text-gray-900 ${
        align === "right" ? "right-0" : "left-0"
      }`}
    >
      {children}
    </div>
  </details>
);
