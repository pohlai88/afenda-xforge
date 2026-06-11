import "server-only";

import {
  requireActiveTenantAccess,
  requireActiveTenantMembership,
} from "@repo/auth/server";
import { bindKeyboardShortcutsAuth } from "@repo/features-workspace-keyboard-shortcuts/server";

bindKeyboardShortcutsAuth({
  requireActiveTenantAccess,
  requireActiveTenantMembership,
});
