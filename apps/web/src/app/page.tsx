"use client";

import HeroSection from "@/components/hero-section";
import FooterSection from "@/components/footer";
import { FeaturedProducts } from "@/components/featured-products";
import { Categories } from "@/components/categories";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <>
      <Header />
      <div className="container mx-auto max-w-9xl px-4 py-2">
        <HeroSection />
        <Categories />
        <FeaturedProducts />
        {/* <Categories />
    <Features /> */}
        {/* <IntegrationsSection />
    <CallToAction /> */}
        <FooterSection />
      </div>
    </>
  );
}
