// components/sections/categories.tsx
import React from "react";
import { CategoryCard } from "@/components/category-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categories = [
  {
    id: 1,
    image: "https://i.redd.it/tz8txze09vt71.jpg",
    imageAlt: "Minecraft category",
    title: "Minecraft",
    description:
      "Servers, plugins, mods, and custom config's for the ultimate Minecraft experience",
    itemCount: 156,
    href: "/categories/minecraft",
  },
  {
    id: 2,
    image: "https://blog.fivemods.io/storage/2024/01/cover-5-1300x650.webp",
    imageAlt: "FiveM category",
    title: "FiveM",
    description:
      "Scripts, maps, vehicles, and roleplay resources for immersive FiveM servers",
    itemCount: 89,
    href: "/categories/fivem",
  },
  {
    id: 3,
    image:
      "https://devforum-uploads.s3.dualstack.us-east-2.amazonaws.com/uploads/optimized/4X/b/b/0/bb0d924415e911555848b69c50725c26d1633b60_2_690x449.jpeg",
    imageAlt: "Roblox category",
    title: "Roblox",
    description:
      "Game assets, scripts, and development tools for creating amazing Roblox experiences",
    itemCount: 234,
    href: "/categories/roblox",
  },
  {
    id: 4,
    image:
      "https://c.pxhere.com/photos/28/3f/code_code_editor_coding_computer_data_developing_development_ethernet-1366450.jpg!d",
    imageAlt: "Websites category",
    title: "Websites",
    description:
      "Templates, themes, and complete website solutions for modern web development",
    itemCount: 67,
    href: "/categories/websites",
  },
];

export function Categories() {
  return (
    <section className="py-20 ">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Browse Categories
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our wide range of digital products and services across
            gaming and web development
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              image={category.image}
              imageAlt={category.imageAlt}
              title={category.title}
              description={category.description}
              itemCount={category.itemCount}
              href={category.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
