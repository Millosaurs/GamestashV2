import { db } from "../../db/";
import { platforms } from "../../db/schema/platforms";
import { os } from "@orpc/server";


export const listPlatforms = os.handler(async () => {

  try {
    const result = await db
      .select({
        id: platforms.id,
        name: platforms.name,
        description: platforms.description,
      })
      .from(platforms)
      .limit(50); // Reduce limit significantly

    return result;
  } catch (error) {
    // Log the full error for debugging
    console.error("Error fetching platforms:", error);
  }
});

export const platformsRoute = {
  list: listPlatforms,
};
