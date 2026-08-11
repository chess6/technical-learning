import {execFileSync} from "node:child_process";
import {existsSync, readFileSync, readdirSync} from "node:fs";
import {dirname, join, relative, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const VALID_MODES = new Set(["A", "B", "C", "D"]);
const ARTIFACTS = ["insight-brief.md", "insight.md", "mastery-contract.md", "lesson-plan.md"];

function read(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function runGit(root, args) {
  try {
    return execFileSync("git", args, {cwd: root, encoding: "utf8"}).trim();
  } catch {
    return "unavailable";
  }
}

function cleanLine(line) {
  return line.replace(/\s+/g, " ").trim().slice(0, 260);
}

function unique(values) {
  return [...new Set(values)];
}

function findLesson(root, lesson, requestedCourse) {
  const coursesRoot = join(root, "docs", "courses");
  const courses = requestedCourse ? [requestedCourse] : readdirSync(coursesRoot);
  const matches = courses.flatMap((course) => {
    const lessonsRoot = join(coursesRoot, course, "lessons");
    if (!existsSync(lessonsRoot)) return [];
    return readdirSync(lessonsRoot)
      .filter((name) => name === lesson || name.endsWith(`-${lesson}`))
      .map((name) => ({course, directory: join(lessonsRoot, name)}));
  });
  if (matches.length !== 1) {
    throw new Error(
      matches.length === 0
        ? `lesson not found: ${lesson}`
        : `lesson id is ambiguous across courses: ${lesson}`,
    );
  }
  return matches[0];
}

function parseSequenceRow(architecture, lesson) {
  return architecture
    .split("\n")
    .find((line) => line.startsWith("|") && line.includes(`\`${lesson}\``)) ?? "not listed";
}

function parseUnit(sequenceRow) {
  const cells = sequenceRow.split("|").map((cell) => cell.trim());
  return cells[4]?.replaceAll("`", "") || "unknown";
}

function parsePackage(sequenceRow) {
  const cells = sequenceRow.split("|").map((cell) => cell.trim());
  return cells[5]?.replaceAll("*", "") || "unknown";
}

function packageStatus(architecture, packageId) {
  if (packageId === "unknown") return "not listed";
  const rows = architecture
    .split("\n")
    .filter((line) => line.startsWith(`| **${packageId}** |`));
  return rows.find((line) => /IN PROGRESS|APPROVED|NOT STARTED/.test(line))
    ?? rows.at(-1)
    ?? "not listed";
}

function artifactState(directory) {
  return ARTIFACTS.map((name) => {
    const path = join(directory, name);
    const body = read(path);
    const state = !body
      ? "missing"
      : name === "insight.md"
        ? /Gate result:\s*PASS/i.test(body)
          ? "PASS"
          : "present, no PASS"
        : "present";
    return {name, path, body, state};
  });
}

function readiness(mode, artifacts) {
  if (mode !== "C") return "READY for bounded work in the requested mode; normal gates still apply.";
  const byName = new Map(artifacts.map((artifact) => [artifact.name, artifact]));
  const missing = ["mastery-contract.md", "lesson-plan.md"].filter(
    (name) => byName.get(name)?.state === "missing",
  );
  if (byName.get("insight.md")?.state !== "PASS") missing.unshift("insight.md with Gate result: PASS");
  return missing.length === 0
    ? "READY for Mode C, subject to approval/standing authorization and package claim checks."
    : `BLOCKED for Mode C: requires ${missing.join(", ")}.`;
}

function contractSignals(artifacts) {
  const signalPattern = /\b(?:C|O|M|E)\d+\b|objective|evidence|route|fixture|Gate result/i;
  const lines = [];
  for (const artifact of artifacts) {
    if (!artifact.body) continue;
    for (const line of artifact.body.split("\n")) {
      if (signalPattern.test(line)) lines.push(`- ${artifact.name}: ${cleanLine(line)}`);
      if (lines.length >= 45) return unique(lines);
    }
  }
  return unique(lines);
}

function dependencyLines(architecture, lesson) {
  return architecture
    .split("\n")
    .filter(
      (line) =>
        line.startsWith("| `") &&
        line.includes(`\`${lesson}\``) &&
        /\| (hard|connection|conditional) \|/.test(line),
    )
    .map(cleanLine);
}

function likelyFiles(root, lesson, course, unit, mode, artifacts) {
  const tracked = runGit(root, ["ls-files"])
    .split("\n")
    .filter(Boolean);
  const tokens = lesson.split("-").filter((token) => token.length > 4);
  const actual = tracked.filter(
    (path) => path.includes(lesson) || tokens.some((token) => path.toLowerCase().includes(token)),
  );
  const docs = artifacts.filter(({body}) => body).map(({path}) => relative(root, path));
  const missingDocs = artifacts.filter(({body}) => !body).map(({path}) => relative(root, path));
  const candidates = [
    ...missingDocs,
    ...(mode === "C"
      ? [
          `src/math/<package helper>.ts`,
          `src/math/__tests__/<package helper>.test.ts`,
          `src/lessons/<lesson definition>.ts`,
          `src/lessons/__tests__/<lesson>GradingContract.test.ts`,
          "src/lessons/assessmentManifest.ts",
          "src/lessons/courseModel.ts",
        ]
      : [`docs/courses/${course}/lessons/${lesson}/`, `docs/courses/${course}/modules/${unit}/`]),
  ];
  return {actual: unique([...docs, ...actual]).slice(0, 35), candidates};
}

function knownFailureModes(root, artifacts, mode) {
  const body = read(join(root, "docs", "quality", "known-failure-modes.md"));
  const headings = body.split("\n").filter((line) => /^## /.test(line));
  const corpus = artifacts.map(({body: artifactBody}) => artifactBody).join("\n").toLowerCase();
  const wanted = [
    "Figure that contradicts",
    "Hardcoded learner-facing copy",
    "bold",
    "display",
    "named route target",
    "invariant repaired",
  ];
  if (mode === "C" && /(scene|visual|animation|explorer)/.test(corpus)) {
    wanted.push("Overlay captions", "claimed operation", "readout written imperatively");
  }
  return headings
    .filter((heading) => wanted.some((fragment) => heading.includes(fragment)))
    .map((heading) => heading.replace(/^## /, ""));
}

function verificationCommands(mode, files) {
  if (mode === "A" || mode === "B") {
    return [
      "npm run context:task -- --mode <mode> --lesson <lesson>",
      "git diff --check",
      "Confirm Gate result: PASS before Gate 5; do not run Mode C from a draft.",
    ];
  }
  if (mode === "D") {
    return ["npm run typecheck", "npx vitest run src/lessons", "./check.sh --quick"];
  }
  const targets = files.actual.filter((path) => /\.test\.(ts|tsx)$/.test(path));
  return [
    "npm run typecheck",
    targets.length > 0 ? `npx vitest run ${targets.join(" ")}` : "npx vitest run <touched test paths>",
    "./check.sh --quick",
    "Open a package-ready pull request for complete unit + serialized browser CI.",
  ];
}

function section(title, lines) {
  const content = lines.length > 0 ? lines.join("\n") : "- None found; open the canonical source if this is unexpected.";
  return `## ${title}\n\n${content}`;
}

export function parseTaskArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--help" || token === "-h") return {help: true};
    if (!["--mode", "--lesson", "--course"].includes(token)) {
      throw new Error(`unknown argument: ${token}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`missing value for ${token}`);
    result[token.slice(2)] = value;
    index += 1;
  }
  const mode = result.mode?.toUpperCase();
  if (!VALID_MODES.has(mode)) throw new Error("--mode must be A, B, C, or D");
  if (!result.lesson) throw new Error("--lesson is required");
  return {mode, lesson: result.lesson, course: result.course};
}

export function buildTaskContext({root, mode, lesson, course}) {
  const located = findLesson(root, lesson, course);
  const architecturePath = join(root, "docs", "courses", located.course, "curriculum-architecture.md");
  const architecture = read(architecturePath);
  const sequence = parseSequenceRow(architecture, lesson);
  const unit = parseUnit(sequence);
  const packageId = parsePackage(sequence);
  const artifacts = artifactState(located.directory);
  const signals = contractSignals(artifacts);
  const dependencies = dependencyLines(architecture, lesson);
  const files = likelyFiles(root, lesson, located.course, unit, mode, artifacts);
  const failures = knownFailureModes(root, artifacts, mode);
  const branch = runGit(root, ["branch", "--show-current"]) || "detached";
  const status = runGit(root, ["status", "--short"]);
  const diff = runGit(root, ["diff", "--stat"]);
  const output = [
    `# Task context — ${lesson} (Mode ${mode})`,
    "",
    `- Course: \`${located.course}\``,
    `- Unit/package: \`${unit}\` / \`${packageId}\``,
    `- Readiness: **${readiness(mode, artifacts)}**`,
    `- Sequence row: ${cleanLine(sequence)}`,
    `- Package ledger: ${cleanLine(packageStatus(architecture, packageId))}`,
    "",
    section("Gate artifacts", artifacts.map(({name, state}) => `- \`${name}\`: ${state}`)),
    "",
    section("Objective, evidence, route, and fixture signals", signals),
    "",
    section("Prerequisite and outbound edges", dependencies.map((line) => `- ${line}`)),
    "",
    section("Likely affected files", [
      ...files.actual.map((path) => `- existing: \`${path}\``),
      ...files.candidates.map((path) => `- candidate: \`${path}\``),
    ]),
    "",
    section("Applicable known-failure modes", failures.map((failure) => `- ${failure}`)),
    "",
    section("Branch and diff", [
      `- Branch: \`${branch}\``,
      `- Status: ${status ? `\n\`\`\`text\n${status}\n\`\`\`` : "clean"}`,
      `- Diff stat: ${diff ? `\n\`\`\`text\n${diff}\n\`\`\`` : "none"}`,
    ]),
    "",
    section("Exact verification", verificationCommands(mode, files).map((command) => `- \`${command}\``)),
    "",
    "This pack is a router, not an approval or a substitute for an ambiguous canonical section.",
  ].join("\n");
  const wordCount = output.trim().split(/\s+/).length;
  if (wordCount > 3000) throw new Error(`context pack exceeded 3000 words (${wordCount})`);
  return output;
}

function usage() {
  return "Usage: npm run context:task -- --mode <A|B|C|D> --lesson <id> [--course <id>]";
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  try {
    const args = parseTaskArgs(process.argv.slice(2));
    if (args.help) {
      console.log(usage());
    } else {
      const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
      console.log(buildTaskContext({root, ...args}));
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error(usage());
    process.exitCode = 1;
  }
}
