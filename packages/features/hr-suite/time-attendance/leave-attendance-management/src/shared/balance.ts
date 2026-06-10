export type LamLeaveBalanceComponents = {
  openingBalance: number;
  earned: number;
  used: number;
  pending: number;
  adjusted: number;
  forfeited: number;
  carriedForward: number;
};

export const lamLeaveBalanceFieldLabels = {
  earned: "Earned",
  used: "Used",
  pending: "Pending",
  adjusted: "Adjusted",
  carriedForward: "Carried Forward",
  forfeited: "Forfeited",
  remaining: "Remaining",
  openingBalance: "Opening Balance",
} as const;

export const computeRemainingBalance = (
  balance: LamLeaveBalanceComponents
): number =>
  balance.openingBalance +
  balance.earned +
  balance.carriedForward +
  balance.adjusted -
  balance.used -
  balance.pending -
  balance.forfeited;

export const withComputedRemainingBalance = <
  T extends LamLeaveBalanceComponents & { remaining?: number },
>(
  balance: T
): T & { remaining: number } => ({
  ...balance,
  remaining: computeRemainingBalance(balance),
});
