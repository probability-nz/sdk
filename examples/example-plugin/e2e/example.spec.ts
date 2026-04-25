import { expect, test } from "@playwright/test";

const SYNC = "wss://sync.probability.nz";
const TEMPLATE = "https://registry.probability.nz/mod.io/8312-5127139/-/mod-7v1w.zip/";

// eslint-disable-next-line no-warning-comments
// TODO: Create the doc directly in the test (via @automerge/automerge-repo against the sync server) to remove the prob.nz dependency and the 8s wait.
test("creates a fresh doc on prob.nz/play, then renders it in the example", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${e.name}: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") {
      errors.push(`[console.error] ${m.text()}`);
    }
  });

  // Step 1: hit prob.nz/play, which creates a doc and updates location.hash with a doc=... param.
  const probHash = `sync=${encodeURIComponent(SYNC)}&template=${encodeURIComponent(TEMPLATE)}`;
  await page.goto(`https://prob.nz/play#${probHash}`);
  await page.waitForFunction(() => location.hash.includes("doc=automerge:"), null, {
    timeout: 30_000,
  });

  const doc = await page.evaluate(() => {
    const m = /doc=(automerge:[A-Za-z0-9]+)/.exec(location.hash);
    return m?.[1] ?? null;
  });
  expect(doc).toMatch(/^automerge:/);

  // Wait for prob.nz to actually sync the new doc to the server before navigating away.
  await page.waitForTimeout(8000);

  // Errors from prob.nz aren't our concern.
  errors.length = 0;

  // Step 2: load the example with the freshly-created doc.
  const hash = encodeURI(JSON.stringify({ doc, sync: [SYNC] }));
  await page.goto(`/#${hash}`);

  await expect(page.getByRole("heading", { name: "Debug Plugin" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Presence" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Document" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Set local state" })).toBeVisible();

  // Doc should load from the sync server within a few seconds.
  await expect(page.locator("pre").last()).toContainText("children", { timeout: 15_000 });

  expect(errors).toEqual([]);
});
