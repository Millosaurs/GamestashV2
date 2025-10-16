import "dotenv/config";
import { createReadStream } from "fs";
import { resolve } from "path";
import { parse } from "csv-parse";
import { db, platforms, categories } from "../db";

type CsvRow = {
  platform_id: string;
  category_id: string;
  [key: string]: string;
};

async function readCsv(csvPath: string): Promise<CsvRow[]> {
  return new Promise((resolveRows, reject) => {
    const rows: CsvRow[] = [];
    createReadStream(csvPath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
        })
      )
      .on("data", (row: CsvRow) => rows.push(row))
      .on("error", reject)
      .on("end", () => resolveRows(rows));
  });
}

async function main() {
  const inputPath = process.argv[2]
    ? resolve(process.argv[2])
    : resolve("/home/shrivatsav/projects/gamestashv2/products.csv");

  const rows = await readCsv(inputPath);

  console.log("Seeding platforms...");

  // Extract unique platforms
  const uniquePlatforms = Array.from(
    new Set(
      rows.map((r) => r.platform_id).filter((v) => v && v.trim().length > 0)
    )
  );

  if (uniquePlatforms.length > 0) {
    await db
      .insert(platforms)
      .values(
        uniquePlatforms.map((id) => ({
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
          description: null,
        }))
      )
      .onConflictDoNothing();
  }

  console.log("Seeding categories...");

  // Extract unique categories per platform
  type CatKey = string;
  const catMap = new Map<
    CatKey,
    { id: string; platformId: string; name: string }
  >();
  for (const r of rows) {
    const id = r.category_id;
    const platformId = r.platform_id;
    if (!id || !platformId) continue;
    const key = `${platformId}::${id}`;
    if (!catMap.has(key)) {
      catMap.set(key, { id, platformId, name: id.charAt(0).toUpperCase() + id.slice(1) });
    }
  }
  const categoriesToInsert = Array.from(catMap.values());

  if (categoriesToInsert.length > 0) {
    await db
      .insert(categories)
      .values(
        categoriesToInsert.map((c) => ({
          id: c.id,
          name: c.name,
          platformId: c.platformId,
        }))
      )
      .onConflictDoNothing();
  }

  console.log(`Seeded platforms and categories from ${inputPath}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
