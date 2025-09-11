import { platformsRoute } from "../lib/procedures/platforms";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { categoriesRoute } from "../lib/procedures/categories";
import { productsRoute } from "../lib/procedures/products";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }: any) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  platforms: platformsRoute,
  categories: categoriesRoute,
  products: productsRoute,
};

export type AppRouter = typeof appRouter;
