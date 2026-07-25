import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

function screenshotPath(name: string): string {
  return path.join(process.cwd(), "screenshots", name);
}

/**
 * Two corrections, checked in the running app.
 *
 * 1. **Course context.** The platform is not "Linear Algebra". The brand is
 *    product-level, the sidebar names the course the current lesson belongs to,
 *    the home page is a catalog, and numbering / Prev–Next are course-relative —
 *    so Karatsuba never reads as the sequel to eigenvectors.
 * 2. **Page grammar.** The internal block names (motivate / watch / check /
 *    explore / summary) drive routing, analytics, styling, and accessible region
 *    descriptions, and are never rendered as headings or ToC rows
 *    (docs/product/semantic-page-grammar.md §1).
 */

const GENERIC_PHASE_LABELS = [
  "Think about it",
  "Watch the idea",
  "Quick check",
  "Try it yourself",
  "Remember this",
];

const LESSON_IDS = [
  "why-linear-algebra",
  "vectors",
  "transformations",
  "systems",
  "elimination",
  "solution-sets",
  "determinants",
  "eigenvectors",
  "karatsuba",
];

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

/* ---------------------------- course context ----------------------------- */

test("the home page is a catalog of courses, not a linear-algebra homepage", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  // The product names itself; no course owns the top of the page.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Interactive Textbook",
  );
  await expect(page.getByRole("heading", { name: "Linear Algebra" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Algorithmic Thinking" }),
  ).toBeVisible();

  // Karatsuba is listed under its own course, not appended to linear algebra.
  const laList = page.locator('ol[aria-label^="Linear Algebra chapters"]');
  const algoList = page.locator('ol[aria-label^="Algorithmic Thinking chapters"]');
  await expect(laList.getByText("Karatsuba", { exact: false })).toHaveCount(0);
  await expect(algoList.getByText("Karatsuba", { exact: false })).toHaveCount(1);

  // …and it is chapter 1 of that course, not chapter 9 of everything.
  await expect(algoList.locator(".home-page__index").first()).toHaveText("1");

  await page.screenshot({
    path: screenshotPath("catalog-home.png"),
    fullPage: true,
  });
  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("a lesson's sidebar shows its own course, not the linear-algebra spine", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("/lesson/karatsuba");
  const sidebar = page.locator(".course-sidebar");
  await expect(sidebar).toHaveAttribute("data-course", "algorithmic-thinking");
  await expect(sidebar.locator(".course-sidebar__course-main")).toHaveText(
    "Algorithmic Thinking",
  );
  // None of the linear-algebra spine leaks in.
  await expect(sidebar.getByRole("link", { name: /Vectors/ })).toHaveCount(0);
  await expect(sidebar.getByRole("link", { name: /Determinants/ })).toHaveCount(0);
  await expect(sidebar.getByRole("link", { name: /Karatsuba/ })).toHaveCount(1);
  await page.screenshot({ path: screenshotPath("karatsuba-course-sidebar.png") });

  await page.goto("/lesson/vectors");
  await expect(page.locator(".course-sidebar")).toHaveAttribute(
    "data-course",
    "linear-algebra",
  );
  await expect(
    page.locator(".course-sidebar .course-sidebar__course-main"),
  ).toHaveText("Linear Algebra");
});

test("the last lesson of a course does not link on to the next course", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/eigenvectors");

  const nav = page.getByRole("navigation", { name: "Lesson navigation" });
  await nav.scrollIntoViewIfNeeded();
  await expect(nav.getByRole("link", { name: /Karatsuba/ })).toHaveCount(0);
  await expect(nav.locator(".lesson-nav__link--next")).toHaveCount(0);
  // Previous stays inside the course.
  await expect(nav.getByRole("link", { name: /Previous/ })).toContainText(
    "Determinants",
  );
  await page.screenshot({ path: screenshotPath("eigenvectors-course-end.png") });
});

/* ----------------------------- page grammar ------------------------------ */

test("no lesson renders a generic phase heading or ToC row", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const lessonId of LESSON_IDS) {
    await page.goto(`/lesson/${lessonId}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Every visible heading and both tables of contents (the on-page one and the
    // sidebar's expansion of the current lesson).
    const visible = await page.evaluate(() => {
      const text = (nodes: Element[]) =>
        nodes.map((n) => (n.textContent ?? "").trim());
      return {
        headings: text([...document.querySelectorAll(".lesson-layout h2, .lesson-layout h3")]),
        pageToc: text([...document.querySelectorAll(".lesson-toc a")]),
        sidebarToc: text([...document.querySelectorAll(".course-sidebar__sublink")]),
      };
    });

    for (const generic of GENERIC_PHASE_LABELS) {
      expect(visible.headings, `${lessonId} heading "${generic}"`).not.toContain(generic);
      expect(visible.pageToc, `${lessonId} page ToC "${generic}"`).not.toContain(generic);
      expect(
        visible.sidebarToc,
        `${lessonId} sidebar ToC "${generic}"`,
      ).not.toContain(generic);
    }

    // The block kinds survive where they belong: as internal metadata.
    const kinds = await page.$$eval("[data-block-kind]", (nodes) =>
      nodes.map((n) => n.getAttribute("data-block-kind")),
    );
    expect(kinds.length, `${lessonId} renders route blocks`).toBeGreaterThan(0);
  }
});

test("lesson heading hierarchy has exactly one h1 and no skipped levels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const lessonId of LESSON_IDS) {
    await page.goto(`/lesson/${lessonId}`);
    await expect(page.locator(".lesson-header__title")).toBeVisible();
    // Let the lazily-loaded explorer settle so its heading is in the document.
    await page.locator(".lesson-layout").last().scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const levels = await page.$$eval("h1, h2, h3, h4, h5, h6", (nodes) =>
      nodes
        .filter((n) => n.closest(".app-shell__main") !== null)
        .map((n) => Number(n.tagName.slice(1))),
    );

    expect(levels.filter((l) => l === 1), `${lessonId} h1 count`).toHaveLength(1);
    expect(levels[0], `${lessonId} starts at h1`).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(
        levels[i]! - levels[i - 1]!,
        `${lessonId}: h${levels[i - 1]} → h${levels[i]} skips a level`,
      ).toBeLessThanOrEqual(1);
    }
  }
});
