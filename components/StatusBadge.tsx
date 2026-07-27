import clsx from "clsx";
import Image from "next/image";

import { StatusIcon } from "@/constants";

export const StatusBadge = ({ status }: { status: Status }) => {
  return (
    <div
      className={clsx("status-badge", {
        "bg-green-600": status === "scheduled" || status === "completed",
        "bg-blue-600": status === "pending" || status === "rescheduled",
        "bg-red-600": status === "cancelled" || status === "no_show",
      })}
    >
      <Image
        src={StatusIcon[status] ?? StatusIcon.pending}
        alt={`${status} status`}
        width={24}
        height={24}
        className="h-fit w-3"
      />
      <p
        className={clsx("text-12-semibold capitalize", {
          "text-green-500": status === "scheduled" || status === "completed",
          "text-blue-500": status === "pending" || status === "rescheduled",
          "text-red-500": status === "cancelled" || status === "no_show",
        })}
      >
        {status.replace("_", " ")}
      </p>
    </div>
  );
};
