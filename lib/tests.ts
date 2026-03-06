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

/**
 * Infers the subject name from file slug (e.g. "informatica-aula7" -> "Informatica").
 */
function inferSubjectFromSlug(slug: string) {
  const rawSubject = slug.replace(/-aula\d+$/i, "");

  return rawSubject
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
        subject: inferSubjectFromSlug(slug),
        lesson: data.lesson,
        questionCount: data.questions.length,
      };
    }),
  );

  return tests.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
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
