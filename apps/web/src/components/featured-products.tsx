// components/sections/featured-products.tsx
import React from "react";
import { OverlayCard } from "@/components/overlay-card";

const featuredProducts = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=450&fit=crop",
    imageAlt: "Minecraft Server Setup",
    title: "Premium Minecraft Server Setup",
    description:
      "Complete server setup with custom plugins and configurations for the ultimate gaming experience",
    author: "ServerPro",
    price: "$49",
    rating: 4.8,
    sold: 234,
    href: "/products/minecraft-server",
    badges: [
      { text: "Featured", variant: "default" as const },
      { text: "Best Seller", variant: "secondary" as const },
    ],
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=450&fit=crop",
    imageAlt: "FiveM Script Pack",
    title: "Advanced FiveM Script Collection",
    description:
      "Professional roleplay scripts for your FiveM server community with premium support",
    author: "RPMaster",
    price: "$89",
    rating: 4.9,
    sold: 156,
    href: "/products/fivem-scripts",
    badges: [{ text: "Popular", variant: "default" as const }],
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=450&fit=crop",
    imageAlt: "Roblox Game Assets",
    title: "Roblox Game Development Kit",
    description:
      "Complete asset pack for creating professional Roblox games with modern graphics",
    author: "GameDev Studio",
    price: "$29",
    rating: 4.7,
    sold: 89,
    href: "/products/roblox-assets",
    badges: [
      { text: "New", variant: "default" as const },
      { text: "Hot Deal", variant: "destructive" as const },
    ],
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    imageAlt: "Website Template",
    title: "Modern Business Website Template",
    description:
      "Responsive website template with modern design and advanced features for businesses",
    author: "WebCraft",
    price: "$79",
    rating: 4.6,
    sold: 67,
    href: "/products/website-template",
    badges: [{ text: "Premium", variant: "secondary" as const }],
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=450&fit=crop",
    imageAlt: "Discord Bot",
    title: "Multi-Purpose Discord Bot",
    description:
      "Feature-rich Discord bot with moderation and entertainment commands for servers",
    author: "BotMakers",
    price: "$39",
    rating: 4.5,
    sold: 123,
    href: "/products/discord-bot",
    badges: [{ text: "Trending", variant: "default" as const }],
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=450&fit=crop",
    imageAlt: "Mobile App UI",
    title: "Mobile App UI Kit",
    description:
      "Complete UI kit for modern mobile app development with stunning components",
    author: "UIExperts",
    price: "$59",
    rating: 4.8,
    sold: 45,
    href: "/products/mobile-ui-kit",
    badges: [{ text: "Design", variant: "secondary" as const }],
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Featured Products
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our most popular digital products and services trusted by
            thousands of customers
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <OverlayCard
              key={product.id}
              image={product.image}
              imageAlt={product.imageAlt}
              title={product.title}
              description={product.description}
              author={product.author}
              price={product.price}
              rating={product.rating}
              sold={product.sold}
              href={product.href}
              badges={product.badges}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
