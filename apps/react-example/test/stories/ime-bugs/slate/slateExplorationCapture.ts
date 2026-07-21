import type { Editor } from "slate";

import type { ImeEventRecord } from "../../ime-logger/serializeImeEvent";
import {
  compactControlStructure,
  compactDomStructure,
  type DomStructureNode,
} from "./compactDomStructure";
import {
  readSlateCompositionSnapshot,
  type SlateCompositionSnapshot,
} from "./readSlateCompositionSnapshot";

/** H3 — map capture events to slate-react Android IM handlers (reading guide). */
export type SourceMapHint = {
  i: number;
  type: string;
  inputType: string | null;
  data: string | null;
  handlers: string[];
  notes: string;
};

const SOURCE_MAP: Record<string, { handlers: string[]; notes: string }> = {
  keydown: {
    handlers: ["Editable.onKeyDown", "android-input-manager: handleKeyDown (229 → defer)"],
    notes: "AF Hangul often key=Process keyCode=229",
  },
  keyup: {
    handlers: ["Editable.onKeyUp"],
    notes: "",
  },
  compositionstart: {
    handlers: [
      "Editable.onCompositionStart",
      "android-input-manager: handleCompositionStart",
      "IS_COMPOSING.set(true)",
    ],
    notes: "Placeholder should be hidden before this on AF",
  },
  compositionupdate: {
    handlers: ["Editable.onCompositionUpdate", "android-input-manager: handleCompositionUpdate"],
    notes: "IME cumulative preedit in data",
  },
  compositionend: {
    handlers: [
      "Editable.onCompositionEnd",
      "android-input-manager: handleCompositionEnd",
      "flush/storeDiff",
    ],
    notes: "Deferred input often follows on AF",
  },
  beforeinput: {
    handlers: ["Editable.onBeforeInput", "android-input-manager: handleDOMBeforeInput"],
    notes: "First insertCompositionText ㄱ — orphan jamo hypothesis",
  },
  input: {
    handlers: ["Editable.onInput", "android-input-manager: handleInput", "applyPendingDiffs?"],
    notes: "DOM value recorded in events[].value",
  },
};

export type ExplorationTimelineRow = {
  i: number;
  type: string;
  inputType: string | null;
  data: string | null;
  eventValue: string;
  slateText: string;
  domText: string;
  placeholderPresent: boolean;
  placeholderDisplay: string | null;
  isComposingWeak: boolean;
  isComposingReact: boolean;
  pendingDiffCount: number;
  selection: SlateCompositionSnapshot["selection"];
  flags: string[];
};

export type ExplorationDomStructureRow = {
  i: number;
  trigger: string;
  data: string | null;
  slate: DomStructureNode[];
  textarea: DomStructureNode[];
};

export type SlateExplorationExport = {
  timeline: ExplorationTimelineRow[];
  firstDivergence: { i: number; flags: string[] } | null;
  domStructures: ExplorationDomStructureRow[];
  sourceMapHints: SourceMapHint[];
  minimalFixture: {
    path: string;
    instruction: string;
  };
  summary: {
    timelineSteps: number;
    domStructureCaptures: number;
  };
};

export type SlateExplorationLog = {
  timeline: ExplorationTimelineRow[];
  domStructures: ExplorationDomStructureRow[];
  clear(): void;
  pushDeferredSnapshot(options: {
    index: number;
    record: ImeEventRecord;
    editor: Editor;
    slateEditable: HTMLElement | null;
    textareaRef: HTMLTextAreaElement | null;
  }): void;
  toExport(options: {
    events: ImeEventRecord[];
  }): SlateExplorationExport;
};

export function buildSourceMapHints(events: ImeEventRecord[], limit = 20): SourceMapHint[] {
  return events.slice(0, limit).map((event, i) => {
    const map = SOURCE_MAP[event.type] ?? {
      handlers: ["(no mapped handler)"],
      notes: "",
    };
    return {
      i,
      type: event.type,
      inputType: event.inputType,
      data: event.data,
      handlers: map.handlers,
      notes: map.notes,
    };
  });
}

export function divergenceFlags(
  record: ImeEventRecord,
  snap: Pick<SlateCompositionSnapshot, "slateText" | "domText">,
): string[] {
  const flags: string[] = [];

  if (record.value !== snap.domText) {
    flags.push("event.value≠domText");
  }
  if (snap.slateText !== snap.domText) {
    flags.push("slateText≠domText");
  }
  if (record.data && snap.domText && record.data !== snap.domText && !snap.domText.includes(record.data)) {
    flags.push("data∉domText");
  }
  if (
    record.data &&
    record.data.length > 1 &&
    snap.domText.length === record.data.length + 1 &&
    snap.domText.endsWith(record.data)
  ) {
    flags.push("orphan-prefix-jamo?");
  }
  if (record.type === "compositionend" && record.data && snap.domText !== record.data) {
    flags.push("compositionend.data≠domText");
  }
  if (record.type === "compositionupdate" && record.data === "가" && snap.domText === "ㄱ") {
    flags.push("stuck-ㄱ-while-data-가");
  }

  return flags;
}

function findFirstDivergence(
  timeline: ExplorationTimelineRow[],
): { i: number; flags: string[] } | null {
  for (const row of timeline) {
    if (row.flags.length > 0) {
      return { i: row.i, flags: row.flags };
    }
  }
  return null;
}

export function createSlateExplorationLog(): SlateExplorationLog {
  const timeline: ExplorationTimelineRow[] = [];
  const domStructures: ExplorationDomStructureRow[] = [];
  let capturedFirstComposeInsert = false;
  let capturedFirstBeforeInput = false;
  let capturedCompositionStart = false;

  function maybeCaptureDomStructure(
    index: number,
    trigger: string,
    record: ImeEventRecord,
    slateEditable: HTMLElement | null,
    textareaRef: HTMLTextAreaElement | null,
  ) {
    domStructures.push({
      i: index,
      trigger,
      data: record.data,
      slate: compactDomStructure(slateEditable),
      textarea: compactControlStructure(textareaRef),
    });
  }

  return {
    timeline,
    domStructures,
    clear() {
      timeline.length = 0;
      domStructures.length = 0;
      capturedFirstComposeInsert = false;
      capturedFirstBeforeInput = false;
      capturedCompositionStart = false;
    },
    pushDeferredSnapshot({ index, record, editor, slateEditable, textareaRef }) {
      const snap = readSlateCompositionSnapshot(editor, slateEditable, { passive: true });
      timeline.push({
        i: index,
        type: record.type,
        inputType: record.inputType,
        data: record.data,
        eventValue: record.value,
        slateText: snap.slateText,
        domText: snap.domText,
        placeholderPresent: snap.placeholderPresent,
        placeholderDisplay: snap.placeholderDisplay,
        isComposingWeak: snap.isComposingWeak,
        isComposingReact: snap.isComposingReact,
        pendingDiffCount: snap.pendingDiffCount,
        selection: snap.selection,
        flags: divergenceFlags(record, snap),
      });

      if (record.type === "beforeinput" && !capturedFirstBeforeInput) {
        capturedFirstBeforeInput = true;
        maybeCaptureDomStructure(index, "first-beforeinput", record, slateEditable, textareaRef);
      }

      if (
        record.type === "beforeinput" &&
        record.inputType === "insertCompositionText" &&
        !capturedFirstComposeInsert
      ) {
        capturedFirstComposeInsert = true;
        maybeCaptureDomStructure(index, "first-insertCompositionText", record, slateEditable, textareaRef);
      }

      if (record.type === "compositionstart" && !capturedCompositionStart) {
        capturedCompositionStart = true;
        maybeCaptureDomStructure(index, "compositionstart", record, slateEditable, textareaRef);
      }
    },
    toExport({ events }) {
      return {
        timeline: [...timeline],
        firstDivergence: findFirstDivergence(timeline),
        domStructures: [...domStructures],
        sourceMapHints: buildSourceMapHints(events),
        minimalFixture: {
          path: "apps/react-example/test/stories/ime-bugs/slate/slate-minimal-dom-fixture.html",
          instruction:
            "Open fixture HTML on AF device (same browser), type 가 — compare orphan ㄱ with Slate timeline",
        },
        summary: {
          timelineSteps: timeline.length,
          domStructureCaptures: domStructures.length,
        },
      };
    },
  };
}
