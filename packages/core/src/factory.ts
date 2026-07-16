import { createRunSiheom, type SiheomRegistries } from "./siheom.ts";
import { query, locatorLog } from "./query.ts";
import type { MessageMap } from "./messages.ts";
import type {
  ActionStepDefinitionDict,
  AssertionStepDefinitionDict,
  GivenStepDefinitionDict,
  Locator,
} from "./types.ts";

export type { MessageMap } from "./messages.ts";

export type SiheomFactoryRegistries<
  TActions extends ActionStepDefinitionDict = ActionStepDefinitionDict,
  TAssertions extends AssertionStepDefinitionDict = AssertionStepDefinitionDict,
  TGivens extends GivenStepDefinitionDict = GivenStepDefinitionDict,
> = SiheomRegistries<TActions, TAssertions, TGivens>;

type LocatorTargetStep = (target: Locator, ...args: never[]) => Promise<void>;

type TargetStepBindings<
  TSteps extends Record<string, LocatorTargetStep>,
  TField extends "action" | "assert",
> = {
  [K in keyof TSteps]: TSteps[K] extends (target: Locator, ...args: infer Args) => Promise<void>
    ? (
        target: Locator,
        ...args: Args
      ) => Record<TField, K & string> & { target: Locator; args?: Args; log: string }
    : never;
};

type ActionBindings<TActions extends ActionStepDefinitionDict> = TargetStepBindings<
  TActions,
  "action"
>;
type AssertionBindings<TAssertions extends AssertionStepDefinitionDict> = TargetStepBindings<
  TAssertions,
  "assert"
>;

type GivenBindings<TGivens extends GivenStepDefinitionDict> = {
  [K in keyof TGivens]: TGivens[K] extends (...args: infer Args) => Promise<void>
    ? (...args: Args) => {
        given: K & string;
        args?: Args;
        log: string;
      }
    : never;
};

export type SiheomBindings<
  TActions extends ActionStepDefinitionDict = ActionStepDefinitionDict,
  TAssertions extends AssertionStepDefinitionDict = AssertionStepDefinitionDict,
  TGivens extends GivenStepDefinitionDict = GivenStepDefinitionDict,
> = {
  runSiheom: ReturnType<typeof createRunSiheom<TActions, TAssertions, TGivens>>;
  actions: ActionBindings<TActions>;
  assertions: AssertionBindings<TAssertions>;
  given: GivenBindings<TGivens>;
  query: typeof query;
};

function assertNewKeysOnly(kind: string, baseKeys: string[], extensionKeys: string[]) {
  const overlap = extensionKeys.filter((key) => baseKeys.includes(key));
  if (overlap.length > 0) {
    throw new Error(
      `extendSiheom: cannot add existing ${kind} keys: ${overlap.join(", ")}. Use overrideSiheom to replace.`,
    );
  }
}

function assertExistingKeysOnly(kind: string, baseKeys: string[], overrideKeys: string[]) {
  const missing = overrideKeys.filter((key) => !baseKeys.includes(key));
  if (missing.length > 0) {
    throw new Error(
      `overrideSiheom: cannot replace unknown ${kind} keys: ${missing.join(", ")}. Use extendSiheom to add.`,
    );
  }
}

function mergeRegistryDict<T extends Record<string, unknown>>(
  kind: string,
  base: T,
  patch: Record<string, unknown>,
  mode: "extend" | "override",
): T {
  const patchKeys = Object.keys(patch);
  if (mode === "extend") {
    assertNewKeysOnly(kind, Object.keys(base), patchKeys);
  } else {
    assertExistingKeysOnly(kind, Object.keys(base), patchKeys);
  }
  return { ...base, ...patch } as T;
}

function buildTargetStepBindings<
  TSteps extends Record<string, LocatorTargetStep>,
  TField extends "action" | "assert",
>(steps: TSteps, field: TField): TargetStepBindings<TSteps, TField> {
  const bindings = {} as TargetStepBindings<TSteps, TField>;
  for (const name of Object.keys(steps) as (keyof TSteps & string)[]) {
    bindings[name] = ((target: Locator, ...args: unknown[]) => ({
      [field]: name,
      target,
      ...(args.length > 0 ? { args } : {}),
      log: `${name}: ${locatorLog(target)}`,
    })) as TargetStepBindings<TSteps, TField>[typeof name];
  }
  return bindings;
}

function buildGivenBindings<TGivens extends GivenStepDefinitionDict>(
  givens: TGivens,
): GivenBindings<TGivens> {
  const bindings = {} as GivenBindings<TGivens>;
  for (const name of Object.keys(givens) as (keyof TGivens & string)[]) {
    bindings[name] = ((...args: unknown[]) => ({
      given: name,
      ...(args.length > 0 ? { args } : {}),
      log: `${name}`,
    })) as GivenBindings<TGivens>[typeof name];
  }
  return bindings;
}

function toBindings<
  TActions extends ActionStepDefinitionDict,
  TAssertions extends AssertionStepDefinitionDict,
  TGivens extends GivenStepDefinitionDict,
>(
  registries: SiheomFactoryRegistries<TActions, TAssertions, TGivens>,
): SiheomBindings<TActions, TAssertions, TGivens> {
  return {
    runSiheom: createRunSiheom(registries),
    actions: buildTargetStepBindings(registries.actions, "action"),
    assertions: buildTargetStepBindings(registries.assertions, "assert"),
    given: buildGivenBindings(registries.givens),
    query,
  };
}

type RegistryPatch = {
  actions?: Record<string, unknown>;
  assertions?: Record<string, unknown>;
  givens?: Record<string, unknown>;
  messages?: MessageMap;
};

function applySiheomPatch<
  TActions extends ActionStepDefinitionDict,
  TAssertions extends AssertionStepDefinitionDict,
  TGivens extends GivenStepDefinitionDict,
>(
  base: SiheomFactoryRegistries<TActions, TAssertions, TGivens>,
  patch: RegistryPatch,
  mode: "extend" | "override",
) {
  return toBindings({
    actions: mergeRegistryDict("action", base.actions, patch.actions ?? {}, mode),
    assertions: mergeRegistryDict("assertion", base.assertions, patch.assertions ?? {}, mode),
    givens: mergeRegistryDict("given", base.givens, patch.givens ?? {}, mode),
    messages: { ...base.messages, ...patch.messages },
  });
}

export function extendSiheom<
  TActions extends ActionStepDefinitionDict,
  TAssertions extends AssertionStepDefinitionDict,
  TGivens extends GivenStepDefinitionDict,
  TNewActions extends ActionStepDefinitionDict = Record<string, never>,
  TNewAssertions extends AssertionStepDefinitionDict = Record<string, never>,
  TNewGivens extends GivenStepDefinitionDict = Record<string, never>,
>(
  base: SiheomFactoryRegistries<TActions, TAssertions, TGivens>,
  extension: {
    actions?: TNewActions;
    assertions?: TNewAssertions;
    givens?: TNewGivens;
    messages?: MessageMap;
  },
): SiheomBindings<TActions & TNewActions, TAssertions & TNewAssertions, TGivens & TNewGivens> {
  return applySiheomPatch(base, extension, "extend") as SiheomBindings<
    TActions & TNewActions,
    TAssertions & TNewAssertions,
    TGivens & TNewGivens
  >;
}

export function overrideSiheom<
  TActions extends ActionStepDefinitionDict,
  TAssertions extends AssertionStepDefinitionDict,
  TGivens extends GivenStepDefinitionDict,
>(
  base: SiheomFactoryRegistries<TActions, TAssertions, TGivens>,
  overrides: {
    actions?: Partial<TActions>;
    assertions?: Partial<TAssertions>;
    givens?: Partial<TGivens>;
    messages?: MessageMap;
  },
): SiheomBindings<TActions, TAssertions, TGivens> {
  return applySiheomPatch(base, overrides, "override") as SiheomBindings<
    TActions,
    TAssertions,
    TGivens
  >;
}
