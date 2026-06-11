import { describe, expect, it } from "vitest";
import type { ShortcutActionId } from "../lib/workspace-shortcuts/contract.ts";
import { GLOBAL_ALLOWED_IN_TEXT_ENTRY } from "../lib/workspace-shortcuts/contract.ts";
import { createBindingFromNormalized } from "../lib/workspace-shortcuts/format-shortcut.ts";
import {
  bindingsMatch,
  isEditableTarget,
  isFnKeyBinding,
  isMediaKeyBinding,
  normalizeKeyboardEvent,
  normalizeShortcutString,
  resolveActionForNormalizedKey,
  resolveActiveShortcutScopes,
} from "../lib/workspace-shortcuts/normalize-shortcut.ts";
import {
  previewUserShortcutPatch,
  resolveEffectiveUserBinding,
} from "../lib/workspace-shortcuts/preview-shortcuts.ts";
import { PRODUCT_SHORTCUT_DEFINITIONS } from "../lib/workspace-shortcuts/product-defaults.ts";
import {
  resolveProductDefaults,
  resolveShortcuts,
  validateUserOverrides,
} from "../lib/workspace-shortcuts/resolve-shortcuts.ts";
import { validateCaptureCollision } from "../lib/workspace-shortcuts/validate-capture-collision.ts";

describe("resolveShortcuts", () => {
  it("returns product defaults when no overrides exist", () => {
    const payload = resolveProductDefaults();

    expect(payload.bindings["workspace.commandSearch"].binding.normalized).toBe(
      "mod+k"
    );
    expect(payload.bindings["workspace.commandSearch"].locked).toBe(true);
    expect(payload.bindings["crud.save"].binding.normalized).toBe("f3");
    expect(payload.policy.allowUserCustomize).toBe(false);
  });

  it("rejects tenant override for locked product actions", () => {
    const payload = resolveShortcuts({
      tenantOverrides: {
        "workspace.commandSearch": "mod+p",
      },
    });

    expect(payload.bindings["workspace.commandSearch"].binding.normalized).toBe(
      "mod+k"
    );
    expect(payload.source["workspace.commandSearch"]).toBe("product");
  });

  it("applies tenant overrides for unlocked actions", () => {
    const payload = resolveShortcuts({
      tenantOverrides: {
        "crud.save": "f6",
      },
    });

    expect(payload.bindings["crud.save"].binding.normalized).toBe("f6");
    expect(payload.source["crud.save"]).toBe("tenant");
  });

  it("allows tenant overrides even when action is tenant-locked for users", () => {
    const payload = resolveShortcuts({
      tenantOverrides: {
        "crud.edit": "f6",
      },
      tenantLockedActions: ["crud.edit"],
    });

    expect(payload.bindings["crud.edit"].binding.normalized).toBe("f6");
    expect(payload.bindings["crud.edit"].locked).toBe(true);
    expect(payload.source["crud.edit"]).toBe("tenant");
  });

  it("blocks user overrides when customization is disabled", () => {
    const payload = resolveShortcuts({
      allowUserCustomize: false,
      userOverrides: {
        "crud.edit": "f6",
      },
    });

    expect(payload.bindings["crud.edit"].binding.normalized).toBe("f2");
    expect(payload.source["crud.edit"]).toBe("product");
  });

  it("applies user overrides when customization is enabled", () => {
    const payload = resolveShortcuts({
      allowUserCustomize: true,
      userOverrides: {
        "crud.edit": "f6",
      },
    });

    expect(payload.bindings["crud.edit"].binding.normalized).toBe("f6");
    expect(payload.source["crud.edit"]).toBe("user");
  });

  it("blocks user overrides on tenant-locked actions", () => {
    const payload = resolveShortcuts({
      allowUserCustomize: true,
      tenantLockedActions: ["crud.edit"],
      userOverrides: {
        "crud.edit": "f6",
      },
    });

    expect(payload.bindings["crud.edit"].binding.normalized).toBe("f2");
    expect(payload.source["crud.edit"]).toBe("product");
  });

  it("prefers user override over tenant override when allowed", () => {
    const payload = resolveShortcuts({
      allowUserCustomize: true,
      tenantOverrides: {
        "crud.edit": "f6",
      },
      userOverrides: {
        "crud.edit": "f7",
      },
    });

    expect(payload.bindings["crud.edit"].binding.normalized).toBe("f7");
    expect(payload.source["crud.edit"]).toBe("user");
  });

  it("does not allow reserved browser keys in overrides", () => {
    const payload = resolveShortcuts({
      tenantOverrides: {
        "crud.save": "f5",
      },
    });

    expect(payload.bindings["crud.save"].binding.normalized).toBe("f3");
  });

  it("blocks fn-key overrides when allowFnKeyBindings is false", () => {
    const payload = resolveShortcuts({
      allowUserCustomize: true,
      allowFnKeyBindings: false,
      userOverrides: {
        "crud.edit": "f6",
      },
    });

    expect(payload.bindings["crud.edit"].binding.normalized).toBe("f2");
  });
});

describe("validateUserOverrides", () => {
  it("accepts valid user overrides when customization is enabled", () => {
    const result = validateUserOverrides(
      { "crud.edit": "f6" },
      { allowUserCustomize: true }
    );

    expect(result).toEqual({ ok: true, overrides: { "crud.edit": "f6" } });
  });

  it("rejects overrides when customization is disabled", () => {
    const result = validateUserOverrides(
      { "crud.edit": "f6" },
      { allowUserCustomize: false }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("disabled by policy");
    }
  });

  it("rejects reserved browser keys", () => {
    const result = validateUserOverrides(
      { "crud.save": "f5" },
      { allowUserCustomize: true }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("reserved");
    }
  });

  it("rejects duplicate bindings within the same patch", () => {
    const result = validateUserOverrides(
      { "crud.edit": "f6", "crud.save": "f6" },
      { allowUserCustomize: true }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Duplicate binding");
    }
  });

  it("rejects bindings that collide with product defaults", () => {
    const result = validateUserOverrides(
      { "crud.edit": "ctrl+k" },
      { allowUserCustomize: true }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("workspace.commandSearch");
    }
  });
});

describe("validateTenantOverrides", () => {
  it("accepts tenant overrides for unlocked actions", async () => {
    const { validateTenantOverrides } = await import(
      "../lib/workspace-shortcuts/resolve-shortcuts.ts"
    );
    const result = validateTenantOverrides({ "crud.save": "f6" }, {});

    expect(result).toEqual({ ok: true, overrides: { "crud.save": "f6" } });
  });

  it("rejects product-locked actions for tenant overrides", async () => {
    const { validateTenantOverrides } = await import(
      "../lib/workspace-shortcuts/resolve-shortcuts.ts"
    );
    const result = validateTenantOverrides(
      { "workspace.commandSearch": "mod+p" },
      {}
    );

    expect(result.ok).toBe(false);
  });
});

describe("validateTenantLockedActions", () => {
  it("rejects product-locked actions in tenant lock list", async () => {
    const { validateTenantLockedActions } = await import(
      "../lib/workspace-shortcuts/resolve-shortcuts.ts"
    );
    const result = validateTenantLockedActions(["workspace.commandSearch"]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("product defaults");
    }
  });

  it("deduplicates locked action ids", async () => {
    const { validateTenantLockedActions } = await import(
      "../lib/workspace-shortcuts/resolve-shortcuts.ts"
    );
    const result = validateTenantLockedActions(["crud.edit", "crud.edit"]);

    expect(result).toEqual({ ok: true, lockedActions: ["crud.edit"] });
  });
});

describe("validateCapturedShortcut", () => {
  it("treats escape as capture cancel", async () => {
    const { validateCapturedShortcut } = await import(
      "../lib/workspace-shortcuts/validate-capture.ts"
    );
    const result = validateCapturedShortcut("escape", "crud.edit", {
      allowFnKeyBindings: true,
    });

    expect(result).toEqual({
      ok: false,
      reason: "Capture cancelled.",
      cancel: true,
    });
  });

  it("rejects reserved browser keys during capture", async () => {
    const { validateCapturedShortcut } = await import(
      "../lib/workspace-shortcuts/validate-capture.ts"
    );
    const result = validateCapturedShortcut("f11", "crud.edit", {
      allowFnKeyBindings: true,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("reserved");
    }
  });
});

describe("product defaults", () => {
  it("includes secondary help binding and CRUD keys", () => {
    const help = PRODUCT_SHORTCUT_DEFINITIONS.find(
      (entry) => entry.actionId === "workspace.openShortcutHelp"
    );

    expect(help?.defaultBinding.normalized).toBe("f1");
    expect(help?.secondaryBinding?.normalized).toBe("mod+/");
    expect(help?.browserConflict).toBe(true);
  });

  it("never uses f5, f11, or f12 in defaults", () => {
    for (const definition of PRODUCT_SHORTCUT_DEFINITIONS) {
      expect(definition.defaultBinding.normalized).not.toMatch(/^f(5|11|12)$/);
      if (definition.secondaryBinding) {
        expect(definition.secondaryBinding.normalized).not.toMatch(
          /^f(5|11|12)$/
        );
      }
    }
  });
});

describe("normalizeShortcutString", () => {
  it("canonicalizes modifier aliases", () => {
    expect(normalizeShortcutString("ctrl+k")).toBe("mod+k");
    expect(normalizeShortcutString("cmd+shift+p")).toBe("mod+shift+p");
    expect(normalizeShortcutString("esc")).toBe("escape");
  });

  it("rejects invalid shortcut strings", () => {
    expect(normalizeShortcutString("")).toBeNull();
    expect(normalizeShortcutString("mod+")).toBeNull();
  });
});

describe("createBindingFromNormalized", () => {
  it("normalizes aliases when creating bindings", () => {
    expect(createBindingFromNormalized("ctrl+k")?.normalized).toBe("mod+k");
  });
});

describe("normalizeKeyboardEvent", () => {
  it("normalizes mod+k shortcuts", () => {
    const event = {
      altKey: false,
      ctrlKey: true,
      key: "k",
      metaKey: false,
      shiftKey: false,
    } as KeyboardEvent;

    expect(normalizeKeyboardEvent(event)).toBe("mod+k");
  });

  it("normalizes function keys", () => {
    const event = {
      altKey: false,
      ctrlKey: false,
      key: "F2",
      metaKey: false,
      shiftKey: false,
    } as KeyboardEvent;

    expect(normalizeKeyboardEvent(event)).toBe("f2");
  });

  it("matches mod+/ alias for mod+shift+?", () => {
    expect(bindingsMatch("mod+shift+?", "mod+/")).toBe(true);
  });
});

describe("scope resolution", () => {
  it("prefers scoped bindings before global fallback", () => {
    const bindings = resolveProductDefaults().bindings;
    const actionId = resolveActionForNormalizedKey("f2", bindings, [
      "crud",
      "global",
    ]);

    expect(actionId).toBe("crud.edit");
  });

  it("derives active scopes from focused targets", () => {
    expect(
      resolveActiveShortcutScopes({
        targetId: "row-1",
        targetType: "cell",
        handlers: {},
      })
    ).toEqual(["grid", "workspace", "global"]);
  });
});

describe("editable target guard", () => {
  it("detects text entry targets", () => {
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");

    expect(isEditableTarget(input)).toBe(true);
    expect(isEditableTarget(textarea)).toBe(true);
    expect(isEditableTarget(null)).toBe(false);
  });

  it("allows global shortcuts in text entry contexts", () => {
    expect(GLOBAL_ALLOWED_IN_TEXT_ENTRY.has("workspace.commandSearch")).toBe(
      true
    );
    expect(
      GLOBAL_ALLOWED_IN_TEXT_ENTRY.has("crud.save" as ShortcutActionId)
    ).toBe(false);
  });
});

describe("capture collision validation", () => {
  it("returns null when binding is unique", () => {
    const payload = resolveProductDefaults();

    expect(
      validateCaptureCollision("crud.edit", "f6", payload, {
        "crud.edit": "f6",
      })
    ).toBeNull();
  });

  it("detects conflicts with another action", () => {
    const payload = resolveProductDefaults();

    expect(
      validateCaptureCollision("crud.edit", "f3", payload, {
        "crud.edit": "f3",
      })
    ).toMatch(/conflicts with crud\.save/i);
  });
});

describe("shortcut preview helpers", () => {
  it("falls back to tenant binding when resetting a user override", () => {
    const payload = resolveShortcuts({
      tenantOverrides: {
        "crud.edit": "f6",
      },
      allowUserCustomize: true,
      userOverrides: {
        "crud.edit": "f7",
      },
    });

    expect(payload.source["crud.edit"]).toBe("user");
    expect(
      resolveEffectiveUserBinding(payload, "crud.edit", {
        "crud.edit": null,
      })
    ).toBe("f6");
  });

  it("falls back to product binding when resetting user override without tenant layer", () => {
    const payload = resolveShortcuts({
      allowUserCustomize: true,
      userOverrides: {
        "crud.edit": "f7",
      },
    });

    expect(
      resolveEffectiveUserBinding(payload, "crud.edit", {
        "crud.edit": null,
      })
    ).toBe("f2");
  });

  it("previews pending user overrides for collision checks", () => {
    const payload = resolveShortcuts({ allowUserCustomize: true });
    const preview = previewUserShortcutPatch(payload, {
      "crud.edit": "f3",
    });

    expect(preview.bindings["crud.edit"].binding.normalized).toBe("f3");
    expect(preview.source["crud.edit"]).toBe("user");
  });
});

describe("fn and media key helpers", () => {
  it("classifies function key bindings", () => {
    expect(isFnKeyBinding("f2")).toBe(true);
    expect(isFnKeyBinding("mod+k")).toBe(false);
  });

  it("detects media key bindings", () => {
    expect(isMediaKeyBinding("audiovolumeup")).toBe(true);
    expect(isMediaKeyBinding("f2")).toBe(false);
  });
});
