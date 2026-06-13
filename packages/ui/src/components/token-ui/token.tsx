"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "../ui-shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui-shadcn/tooltip";

type TokenContextValue = {
  name: string;
  value: string;
};

const TokenContext = React.createContext<TokenContextValue | undefined>(
  undefined,
);

function useTokenContext() {
  const context = React.useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useTokenContext must be used within a TokenProvider");
  }
  return context;
}

type TokenProviderProps = {
  name: string;
  value: string;
  children: React.ReactNode;
};

function TokenProvider({ name, value, children }: TokenProviderProps) {
  const contextValue = React.useMemo(() => ({ name, value }), [name, value]);
  return (
    <TokenContext.Provider value={contextValue}>{children}</TokenContext.Provider>
  );
}

type TokenRootProps = React.ComponentProps<typeof Tooltip>;

function TokenRoot({ delayDuration = 200, ...props }: TokenRootProps) {
  return <Tooltip delayDuration={delayDuration} {...props} />;
}

type TokenNameProps = React.ComponentProps<typeof Button> & {
  copyable?: boolean;
};

const TokenName = React.forwardRef<
  React.ComponentRef<typeof Button>,
  TokenNameProps
>(({ children, onClick, copyable = true, ...props }, forwardedRef) => {
  const { name } = useTokenContext();
  const [isCopied, setIsCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      if (!copyable) {
        return;
      }

      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        return;
      }

      try {
        await navigator.clipboard.writeText(name);
        setIsCopied(true);
        timeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
      } catch {
        // Silently fail
      }
    },
    [name, onClick, copyable],
  );

  return (
    <TooltipTrigger asChild>
      <Button
        ref={forwardedRef}
        size="sm"
        variant="outline"
        onClick={handleClick}
        aria-label={copyable && isCopied ? `Copied ${name}` : `Copy ${name}`}
        {...props}
      >
        {copyable && isCopied ? "Copied!" : (children ?? name)}
      </Button>
    </TooltipTrigger>
  );
});

TokenName.displayName = "TokenName";

type TokenValueProps = React.ComponentProps<typeof TooltipContent>;

const TokenValue = React.forwardRef<
  React.ComponentRef<typeof TooltipContent>,
  TokenValueProps
>(({ sideOffset = 4, ...props }, forwardedRef) => {
  return (
    <TooltipContent ref={forwardedRef} sideOffset={sideOffset} {...props} />
  );
});

TokenValue.displayName = "TokenValue";

type TokenIndicatorProps = React.ComponentProps<"span">;

const TokenIndicator = React.forwardRef<HTMLSpanElement, TokenIndicatorProps>(
  ({ className, style, children, ...props }, forwardedRef) => {
    const { value } = useTokenContext();

    return (
      <span
        ref={forwardedRef}
        aria-hidden
        className={cn(
          "inline-flex size-4 items-center justify-center rounded-full align-middle",
          className,
        )}
        style={{ backgroundColor: value, ...style }}
        {...props}
      >
        {children}
      </span>
    );
  },
);

TokenIndicator.displayName = "TokenIndicator";

type TokenProps = React.ComponentProps<typeof Tooltip> & {
  name: string;
  value: string;
  children?: React.ReactNode;
};

function Token({ name, value, children, ...props }: TokenProps) {
  return (
    <TokenProvider name={name} value={value}>
      <TokenRoot {...props}>
        {children}
        <TokenValue>{value}</TokenValue>
      </TokenRoot>
    </TokenProvider>
  );
}

type BasicTokenProps = TokenProps & {
  copyable?: boolean;
};

function BasicToken({ name, value, copyable, ...props }: BasicTokenProps) {
  return (
    <Token name={name} value={value} {...props}>
      <TokenName copyable={copyable} />
    </Token>
  );
}

export {
  Token,
  BasicToken,
  BasicToken as default,
  TokenProvider,
  TokenRoot,
  TokenName,
  TokenValue,
  TokenIndicator,
  useTokenContext,
  type TokenProps,
  type BasicTokenProps,
  type TokenNameProps,
  type TokenProviderProps,
  type TokenIndicatorProps,
  type TokenRootProps,
  type TokenValueProps,
};
