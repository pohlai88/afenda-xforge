import type { UIMessage } from "ai";
import type { ComponentProps } from "react";
import { Streamdown } from "streamdown";
import { twMerge } from "tailwind-merge";

export type MessageProps = {
  data: UIMessage;
  markdown?: ComponentProps<typeof Streamdown>;
  className?: string;
};

export const Message = ({ data, markdown, className }: MessageProps) => {
  const content = data.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

  return (
    <div
      className={twMerge(
        "flex max-w-[80%] flex-col gap-2 rounded-xl px-4 py-2",
        data.role === "user"
          ? "self-end bg-foreground text-background"
          : "self-start bg-muted",
        className
      )}
    >
      <Streamdown {...markdown}>{content}</Streamdown>
    </div>
  );
};
