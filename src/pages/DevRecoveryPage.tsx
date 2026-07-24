/**
 * Development-only persistence recovery surface (Package F4).
 *
 * Executable failure/recovery for the single-user localStorage learner state:
 *  - EXPORT the current bytes (raw stored blob, or the in-memory state when the
 *    stored blob is unreadable) so nothing is lost before a reset;
 *  - IMPORT a previously exported blob (re-armed as the live state);
 *  - RESET (the only sanctioned overwrite of unreadable/newer-schema bytes).
 *
 * Recovery messaging distinguishes corrupt bytes, a newer/unmigratable schema,
 * and a failed save (storage full / disabled), rather than silently claiming
 * persistence.
 */

import { useState } from "react";
import { useLearnerState } from "../platform/useLearnerState";

export function DevRecoveryPage() {
  const { phase, readOnly, saveHealthy, loadOutcome, exportState, importState, resetState } =
    useLearnerState();
  const [exported, setExported] = useState<string | null>(null);
  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const recovery = describeRecovery({ readOnly, saveHealthy, loadOutcome });

  const doExport = () => setExported(exportState());

  const doImport = () => {
    const outcome = importState(importText);
    switch (outcome.kind) {
      case "loaded":
        setImportMessage("Imported — this is now your live, saved state.");
        break;
      case "empty":
        setImportMessage("Nothing to import (empty payload).");
        break;
      case "corrupt":
        setImportMessage("Import failed: the pasted text is not valid JSON.");
        break;
      case "incompatible":
        setImportMessage(
          outcome.reason === "newer-schema"
            ? "Import refused: that data is from a NEWER app version."
            : "Import refused: that data could not be migrated to this version.",
        );
        break;
    }
  };

  const doReset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset discards the current stored learner state. Export first if unsure. Continue?")
    ) {
      return;
    }
    resetState();
    setImportMessage("State reset to empty.");
    setExported(null);
  };

  return (
    <div className="dev-recovery" style={{ maxWidth: "52rem", margin: "0 auto" }}>
      <h1>Learner-state recovery (dev)</h1>

      <p
        data-testid="recovery-status"
        data-kind={recovery.kind}
        role={recovery.severe ? "alert" : "status"}
        style={{
          padding: "0.75rem 1rem",
          borderRadius: "0.5rem",
          background: recovery.severe ? "#fdecea" : "#eef4ff",
          color: recovery.severe ? "#8a1c14" : "#22406e",
        }}
      >
        {recovery.message}
      </p>

      <section aria-labelledby="recovery-export">
        <h2 id="recovery-export">Export</h2>
        <p>Download a copy of your current learner state before resetting.</p>
        <button type="button" className="btn" data-testid="recovery-export" onClick={doExport}>
          Export current state
        </button>
        {exported !== null && (
          <textarea
            data-testid="recovery-export-output"
            readOnly
            rows={8}
            value={exported}
            style={{ width: "100%", marginTop: "0.75rem", fontFamily: "monospace" }}
          />
        )}
      </section>

      <section aria-labelledby="recovery-import">
        <h2 id="recovery-import">Import</h2>
        <p>Paste a previously exported blob to restore it as the live state.</p>
        <textarea
          data-testid="recovery-import-input"
          rows={8}
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          placeholder="Paste exported JSON here…"
          style={{ width: "100%", fontFamily: "monospace" }}
        />
        <div style={{ marginTop: "0.5rem" }}>
          <button type="button" className="btn" data-testid="recovery-import" onClick={doImport}>
            Import
          </button>
        </div>
        {importMessage && (
          <p data-testid="recovery-import-message" role="status">
            {importMessage}
          </p>
        )}
      </section>

      <section aria-labelledby="recovery-reset">
        <h2 id="recovery-reset">Reset</h2>
        <p>
          Start fresh. This is the only action that overwrites unreadable or
          newer-schema bytes — export first if you might need them.
        </p>
        <button
          type="button"
          className="btn btn--ghost"
          data-testid="recovery-reset"
          onClick={doReset}
        >
          Reset to empty
        </button>
      </section>

      <p style={{ color: "#667", marginTop: "1.5rem" }}>
        Phase: <code>{phase}</code>
      </p>
    </div>
  );
}

function describeRecovery({
  readOnly,
  saveHealthy,
  loadOutcome,
}: {
  readOnly: boolean;
  saveHealthy: boolean;
  loadOutcome: ReturnType<typeof useLearnerState>["loadOutcome"];
}): { kind: string; message: string; severe: boolean } {
  if (loadOutcome?.kind === "corrupt") {
    return {
      kind: "corrupt",
      severe: true,
      message:
        "Stored data was unreadable (corrupt) and is preserved untouched. This session runs in memory only — export it if useful, then Reset to start saving again.",
    };
  }
  if (loadOutcome?.kind === "incompatible") {
    return {
      kind: `incompatible-${loadOutcome.reason}`,
      severe: true,
      message:
        loadOutcome.reason === "newer-schema"
          ? "Stored data is from a NEWER app version and is preserved read-only so a downgrade can’t destroy it. Export it, or Reset to start fresh (this discards it)."
          : "Stored data could not be migrated to this version and is preserved read-only. Export it, or Reset to start fresh (this discards it).",
    };
  }
  if (readOnly) {
    return {
      kind: "read-only",
      severe: true,
      message: "Saving is disabled for this session; stored bytes are preserved untouched.",
    };
  }
  if (!saveHealthy) {
    return {
      kind: "save-failed",
      severe: true,
      message:
        "A save failed (storage may be full or disabled). Your work is kept in memory only — export a copy now before reloading.",
    };
  }
  return {
    kind: "healthy",
    severe: false,
    message: "Persistence is healthy. Your work is being saved locally.",
  };
}
