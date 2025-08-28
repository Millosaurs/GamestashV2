import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CircleDollarSign, PanelTop, Pickaxe, ToyBrick } from "lucide-react";
import type { ReactNode } from "react";

export default function Features() {
  return (
    <section className="py-16 md:py-32">
      <div className="@container mx-auto max-w-9xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Made to cover your games
          </h2>
          <p className="mt-4">
            We offer many mods, plugins, skripts, packs over many games.
          </p>
        </div>
        <div className="@min-4xl:max-w-full @min-4xl:grid-cols-4 mx-auto mt-8 grid max-w-sm gap-6 [--color-background:var(--color-muted)] [--color-card:var(--color-muted)] *:text-center md:mt-16 dark:[--color-muted:var(--color-zinc-900)] ">
          <Card className="group border-0 shadow-none bg-transparent">
            <CardHeader className=" ">
              <CardDecorator>
                <Pickaxe className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Minecraft</h3>
            </CardHeader>

            <CardContent>
              <p className="  text-sm">
                Extensive minecraft mods and plugins, allowing you to tailor every
                aspect to meet your specific needs.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-none bg-transparent">
            <CardHeader className=" ">
              <CardDecorator>
                <CircleDollarSign className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">FiveM</h3>
            </CardHeader>

            <CardContent>
              <p className="  text-sm">
                From cars, buildings to npc's and players get everything to build your own city or to destroy it however you want.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-none bg-transparent">
            <CardHeader className=" ">
              <CardDecorator>
                <PanelTop className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Websites</h3>
            </CardHeader>

            <CardContent>
              <p className="  text-sm">
                Simple HTML, CSS files to complex react & vue apps. Make your own webstore or amazon from our drag and drop tamplets
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-none bg-transparent">
            <CardHeader className=" ">
              <CardDecorator>
                <ToyBrick className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Roblox</h3>
            </CardHeader>

            <CardContent>
              <p className="  text-sm">
                Buy scripts, maps, avatars, pets, items, passes, skins, bundles, and more—customize every detail for a unique Roblox adventure.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
    />
    <div
      aria-hidden
      className="bg-radial to-background absolute inset-0 from-transparent to-75%"
    />
    <div className="dark:bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t bg-white">
      {children}
    </div>
  </div>
);
