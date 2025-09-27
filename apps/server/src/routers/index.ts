import { platformsRoute } from "../lib/procedures/platforms";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { categoriesRoute } from "../lib/procedures/categories";
import { productsRoute } from "../lib/procedures/products";
import { userRouter } from "../lib/procedures/user";

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
  user: userRouter,
};

export type AppRouter = typeof appRouter;
