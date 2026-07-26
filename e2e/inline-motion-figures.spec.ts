import { expect, test } from "@playwright/test";

const figures = [
  {
    route: "/lesson/transformations",
    label: /matrix column and its transformed grid/i,
    stem: "matrix-origin-fixed",
  },
  {
    route: "/lesson/elimination",
    label: /second constraint line pivots/i,
    stem: "elimination-fixed-intersection",
  },
  {
    route: "/lesson/red-black-trees",
    label: /2–3–4 node splits/i,
    stem: "red-black-split-recolour",
  },
] as const;

test.describe("inline production motion figures", () => {
  for (const figure of figures) {
    test(`${figure.stem} loads both formats and poster`, async ({
      page,
      request,
    }) => {
      await page.goto(figure.route);
      const video = page.getByLabel(figure.label);
      await video.scrollIntoViewIfNeeded();
      await expect(video).toBeVisible();
      expect(
        await video.evaluate((element: HTMLVideoElement) => element.muted),
      ).toBe(true);
      await expect(video).toHaveAttribute("loop", "");
      await expect(video).toHaveAttribute("playsinline", "");

      const sources = video.locator("source");
      await expect(sources.nth(0)).toHaveAttribute(
        "src",
        `/media/inline-motion/${figure.stem}.webm`,
      );
      await expect(sources.nth(1)).toHaveAttribute(
        "src",
        `/media/inline-motion/${figure.stem}.mp4`,
      );

      for (const extension of ["webm", "mp4", "png"]) {
        const response = await request.get(
          `/media/inline-motion/${figure.stem}.${extension}`,
        );
        expect(response.ok()).toBe(true);
        expect(
          Number(response.headers()["content-length"] ?? 0),
        ).toBeGreaterThan(1_000);
      }
    });
  }

  test("pauses outside the viewport and resumes on re-entry", async ({
    page,
  }) => {
    await page.goto("/lesson/elimination");
    const video = page.getByLabel(/second constraint line pivots/i);
    await video.scrollIntoViewIfNeeded();
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
      .toBe(false);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
      .toBe(true);

    await video.scrollIntoViewIfNeeded();
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
      .toBe(false);
  });

  test("uses a still poster under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/lesson/transformations");
    await expect(
      page.getByLabel(/matrix column and its transformed grid/i),
    ).toHaveCount(0);
    const poster = page.getByAltText(/matrix column and its transformed grid/i);
    await poster.scrollIntoViewIfNeeded();
    await expect(poster).toBeVisible();
    await expect(poster).toHaveAttribute(
      "src",
      "/media/inline-motion/matrix-origin-fixed.png",
    );
  });

  test("lays out beside prose on desktop and stacks on narrow screens", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/lesson/transformations");
    const section = page.locator(".lesson-section--with-motion").first();
    await section.scrollIntoViewIfNeeded();
    const desktopColumns = await section.evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns,
    );
    expect(desktopColumns.trim().split(/\s+/)).toHaveLength(2);

    await page.setViewportSize({ width: 640, height: 900 });
    const narrowColumns = await section.evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns,
    );
    expect(narrowColumns.trim().split(/\s+/)).toHaveLength(1);
    await expect(section.locator(".inline-motion-figure")).toBeVisible();
  });
});
