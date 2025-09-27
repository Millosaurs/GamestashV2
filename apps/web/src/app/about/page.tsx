import React from "react";
import {
  Shield,
  Star,
  Zap,
  Headphones,
  Gamepad2,
  Users,
  Trophy,
  Download,
} from "lucide-react";
import { Header } from "@/components/header";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  className = "",
}) => (
  <div
    className={`bg-card border border-border rounded-lg p-6 transition-colors hover:bg-accent/50 ${className}`}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-primary/10 p-2 rounded-md">
        <Icon className="size-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
    </div>
    <p className="text-muted-foreground text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

interface StatCardProps {
  number: string | number;
  label: string;
  icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ number, label, icon: Icon }) => (
  <div className="text-center">
    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
      <Icon className="size-6 text-primary" />
    </div>
    <div className="font-bold text-2xl text-foreground mb-1">{number}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background ">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-background border-b border-border pt-20">
          <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Gamepad2 className="size-4" />
                Built for gamers, by gamers
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
                About <span className="text-primary">Gamestash</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We have a vision to create a marketplace where we gather the
                most talented gaming setup creators and share their valuable
                products for the benefit of all gamers.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              <StatCard number="10K+" label="Gaming Setups" icon={Gamepad2} />
              <StatCard number="5K+" label="Active Developers" icon={Users} />
              <StatCard number="50K+" label="Downloads" icon={Download} />
              <StatCard number="4.8" label="Average Rating" icon={Star} />
            </div>
          </div>
        </section>

        {/* What is Gamestash */}
        <section className="py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                What is Gamestash?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Gamestash is much more than a platform! We offer easy ways to
                set up your server and help connect developers with the gaming
                community.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={Shield}
                title="Safe & Secure"
                description="Always use your own judgment before downloading. We help keep the platform safe with reporting features and community moderation."
              />
              <FeatureCard
                icon={Star}
                title="Developer Ratings"
                description="Check developer ratings before purchasing. Our transparent rating system helps you make informed decisions."
              />
              <FeatureCard
                icon={Zap}
                title="Instant Delivery"
                description="Get your setup configurations and guides delivered instantly after purchase. No waiting, just gaming."
              />
              <FeatureCard
                icon={Headphones}
                title="Premium Support"
                description="Customer support is available to help you with any questions or issues. We're here for the community."
              />
              <FeatureCard
                icon={Trophy}
                title="Quality Products"
                description="Products ranging from free to premium, created by talented developers with significant time and effort."
              />
              <FeatureCard
                icon={Users}
                title="Growing Community"
                description="Connect with developers and fellow gamers. Together we make the gaming community stronger!"
              />
            </div>
          </div>
        </section>

        {/* Why Choose Gamestash */}
        <section className="py-16 lg:py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Why Choose Products from Gamestash?
              </h2>
              <p className="text-lg text-muted-foreground">
                With us you are always in safe hands.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                    <Gamepad2 className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Comprehensive Solutions
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Plugins, setups, configurations, and guides made to help
                      your server grow and thrive in the gaming ecosystem.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                    <Users className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Individual Developers
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Products uploaded by talented individual developers. While
                      not manually verified, our community reporting keeps
                      things safe.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                    <Shield className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Report System
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      You can report problems regarding products to help keep
                      the platform safe for everyone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-8">
                <h3 className="font-semibold text-foreground mb-4">
                  Safety First
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  We strive to keep our platform a safe place. If you experience
                  any issues or believe a product is harmful or misleading,
                  please contact us or use our report feature.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> Developers are not manually verified
                    by Gamestash. Always use your own judgment before
                    downloading.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Custom Orders */}
        <section className="py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Custom Orders
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get your very own gaming setup designed to your exact needs! Our
                expert developers can create anything tailored specifically for
                you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-foreground">
                  Custom Configurations
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-foreground">
                  Server Setups
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-foreground">
                  Custom Plugins
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-foreground">
                  Tailored Solutions
                </div>
              </div>
            </div>

            <div className="text-center">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md font-medium transition-colors">
                Start Custom Order
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card border-t border-border py-12">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gamepad2 className="size-6 text-primary" />
              <span className="text-xl font-bold text-foreground">
                Gamestash
              </span>
            </div>
            <p className="text-muted-foreground mb-4">
              The ultimate marketplace for gaming setups. Discover, buy, and
              sell the perfect gaming battlestation.
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 Gamestash. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
