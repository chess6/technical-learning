import { describe, expect, it, vi } from "vitest";
import { postLabArtifact } from "../artifactRequests";

describe("postLabArtifact", () => {
  it("returns the parsed response only for a successful write", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(JSON.stringify({ saved: "/tmp/evidence.png" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );

    await expect(
      postLabArtifact(
        "/__benchmark-lab/capture",
        { name: "pair", dataUrl: "data:image/png;base64,AA==" },
        fetcher,
      ),
    ).resolves.toEqual({ saved: "/tmp/evidence.png" });
    expect(fetcher).toHaveBeenCalledWith(
      "/__benchmark-lab/capture",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws when the server rejects a capture instead of reporting success", async () => {
    const fetcher = vi.fn(
      async () => new Response("disk write failed", { status: 500 }),
    );

    await expect(
      postLabArtifact(
        "/__benchmark-lab/capture",
        { name: "pair", dataUrl: "data:image/png;base64,AA==" },
        fetcher,
      ),
    ).rejects.toThrow(/500.*disk write failed/);
  });

  it("throws when a nominal success response is not valid JSON", async () => {
    const fetcher = vi.fn(
      async () => new Response("not json", { status: 200 }),
    );

    await expect(
      postLabArtifact(
        "/__benchmark-lab/report",
        { name: "report", report: {} },
        fetcher,
      ),
    ).rejects.toThrow(/invalid JSON/);
  });
});
