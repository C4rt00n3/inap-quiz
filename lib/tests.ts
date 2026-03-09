import { promises as fs } from "node:fs";
import path from "node:path";
import type { TestData, TestSummary } from "@/types/test";

const dataDirectory = path.join(process.cwd(), "data");

/**
 * Remove UTF-8 BOM from file content when present.
 */
function removeBom(content: string) {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
}

/**
 * Ensures a parsed JSON object has the minimum required test structure.
 */
function isValidTestData(value: unknown): value is TestData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TestData>;

  return (
    typeof candidate.title === "string" &&
    typeof candidate.subject === "string" &&
    typeof candidate.lesson === "string" &&
    typeof candidate.level === "string" &&
    Array.isArray(candidate.questions)
  );
}

/**
 * Reads and parses a single test JSON file from disk.
 */
async function readTestFile(filePath: string): Promise<TestData> {
  const fileContent = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(removeBom(fileContent)) as unknown;

  if (!isValidTestData(parsed)) {
    throw new Error(`Arquivo de teste invalido: ${path.basename(filePath)}`);
  }

  return parsed;
}

/**
 * Creates a URL-safe slug from a file name.
 */
function toSlug(fileName: string) {
  return fileName.replace(/\.json$/i, "");
}

function getLessonNumber(lesson: string) {
  const match = lesson.match(/aula\s*(\d+)/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function getLevelOrder(level: TestSummary["level"]) {
  if (level === "Basico") {
    return 0;
  }
  if (level === "Intermediario") {
    return 1;
  }
  return 2;
}

/**
 * Lists all tests available in the data folder for the home page.
 */
export async function getAllTests(): Promise<TestSummary[]> {
  const files = await fs.readdir(dataDirectory);
  const jsonFiles = files.filter((file) => file.toLowerCase().endsWith(".json"));

  const tests = await Promise.all(
    jsonFiles.map(async (fileName) => {
      const fullPath = path.join(dataDirectory, fileName);
      const data = await readTestFile(fullPath);
      const slug = toSlug(fileName);

      return {
        slug,
        title: data.title,
        subject: data.subject,
        lesson: data.lesson,
        level: data.level,
        questionCount: data.questions.length,
      };
    }),
  );

  return tests.sort((a, b) => {
    const subjectDiff = a.subject.localeCompare(b.subject, "pt-BR");
    if (subjectDiff !== 0) {
      return subjectDiff;
    }

    const lessonDiff = getLessonNumber(a.lesson) - getLessonNumber(b.lesson);
    if (lessonDiff !== 0) {
      return lessonDiff;
    }

    return getLevelOrder(a.level) - getLevelOrder(b.level);
  });
}

/**
 * Reads a test by slug. Returns null when the file does not exist.
 */
export async function getTestBySlug(slug: string): Promise<TestData | null> {
  const filePath = path.join(dataDirectory, `${slug}.json`);

  try {
    return await readTestFile(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}
