import { platformsRoute } from "@/lib/procedures/platforms";
import { diagnosticsRoute } from "@/lib/procedures/diagnostics";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { categoriesRoute } from "@/lib/procedures/categories";

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
  diagnostics: diagnosticsRoute,
  categories: categoriesRoute,
};

export type AppRouter = typeof appRouter;
