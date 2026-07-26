export type LabArtifactFetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

/**
 * POST a benchmark artifact and fail unless the server both accepts the write
 * and returns its JSON acknowledgement.
 */
export async function postLabArtifact(
  url: string,
  payload: unknown,
  fetcher: LabArtifactFetcher = fetch,
): Promise<unknown> {
  const response = await fetcher(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(
      `POST ${url} failed (${response.status}): ` +
        (body.trim() || response.statusText || "request rejected"),
    );
  }
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new Error(`POST ${url} returned invalid JSON`);
  }
}
