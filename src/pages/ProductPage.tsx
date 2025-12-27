import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Users, Zap, Lock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Members",
    description: "Every member is carefully vetted and verified before joining the network.",
  },
  {
    icon: Users,
    title: "Smart Matching",
    description: "Our platform intelligently connects advisors with laboratories based on expertise and needs.",
  },
  {
    icon: Zap,
    title: "Seamless Collaboration",
    description: "Built-in tools for secure communication, document sharing, and project management.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Bank-grade encryption and compliance with global privacy regulations.",
  },
];

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
              <h1 className="font-display text-4xl lg:text-5xl font-medium text-foreground mb-6 animate-fade-in">
                The Platform
              </h1>
              <p className="text-lg text-muted-foreground font-body animate-fade-in-delayed">
                AdvisorNet is a private, secure platform designed for meaningful professional 
                connections between advisors and laboratories.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="p-8 rounded-xl border border-divider bg-surface-elevated animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-medium text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground font-body">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
