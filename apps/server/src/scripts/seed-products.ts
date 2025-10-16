import "dotenv/config";
import { createReadStream } from "fs";
import { resolve } from "path";
import { parse } from "csv-parse";
import { randomUUID } from "crypto";
import { db, platforms, categories, products } from "../db";

type CsvRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: string;
  original_price: string;
  discount: string;
  platform_id: string;
  category_id: string;
  rating: string;
  review_count: string;
  sold: string;
  image: string;
  author: string;
  is_featured: string;
  is_new: string;
  created_at: string;
  updated_at: string;
  tags: string;
  content: string;
  author_id: string;
};

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  if (v === "true" || v === "t" || v === "1") return true;
  if (v === "false" || v === "f" || v === "0") return false;
  return false;
}

function nullIfEmpty<T extends string | undefined>(v: T): string | null {
  if (v === undefined) return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

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

  // Upsert platforms
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
          name: id,
          description: null,
        }))
      )
      .onConflictDoNothing();
  }

  // Upsert categories (composite key platform_id + id)
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
      catMap.set(key, { id, platformId, name: id });
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

  // Insert products
  if (rows.length > 0) {
    // Optional: wipe existing products when seeding fresh
    // await db.delete(products);

    const batchSize = 200;
    const toProducts = (r: CsvRow) => ({
      id: randomUUID(),
      slug: r.slug,
      name: r.name,
      description: r.description ?? "",
      content: r.content ?? "",
      price: r.price && r.price.trim() !== "" ? r.price : "0",
      originalPrice:
        r.original_price && r.original_price.trim() !== ""
          ? r.original_price
          : "0",
      discount: r.discount && r.discount.trim() !== "" ? Number(r.discount) : 0,
      platformId: r.platform_id,
      categoryId: r.category_id,
      rating: r.rating && r.rating.trim() !== "" ? Number(r.rating) : 0,
      reviewCount:
        r.review_count && r.review_count.trim() !== ""
          ? Number(r.review_count)
          : 0,
      sold: r.sold && r.sold.trim() !== "" ? Number(r.sold) : 0,
      image: nullIfEmpty(r.image),
      author: r.author,
      authorId: nullIfEmpty(r.author_id),
      isFeatured: parseBoolean(r.is_featured),
      isNew: parseBoolean(r.is_new),
      tags: nullIfEmpty(r.tags) ? (JSON.parse(r.tags) as unknown) : null,
      createdAt:
        r.created_at && r.created_at.trim()
          ? new Date(r.created_at)
          : new Date(),
      updatedAt:
        r.updated_at && r.updated_at.trim()
          ? new Date(r.updated_at)
          : new Date(),
    });

    for (let i = 0; i < rows.length; i += batchSize) {
      const slice = rows.slice(i, i + batchSize).map(toProducts);
      await db.insert(products).values(slice).onConflictDoNothing();
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded products from ${inputPath}`);
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
