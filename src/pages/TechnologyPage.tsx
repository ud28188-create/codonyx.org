import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Database, Cloud, Shield, Cpu } from "lucide-react";

const techStack = [
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description: "All communications and data are protected with military-grade encryption.",
  },
  {
    icon: Cloud,
    title: "Cloud Infrastructure",
    description: "Built on enterprise-grade cloud infrastructure with 99.99% uptime SLA.",
  },
  {
    icon: Database,
    title: "Secure Data Storage",
    description: "Your data is stored in geographically distributed, redundant data centers.",
  },
  {
    icon: Cpu,
    title: "AI-Powered Matching",
    description: "Intelligent algorithms connect you with the most relevant network members.",
  },
];

export default function TechnologyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
              <h1 className="font-display text-4xl lg:text-5xl font-medium text-foreground mb-6 animate-fade-in">
                Technology
              </h1>
              <p className="text-lg text-muted-foreground font-body animate-fade-in-delayed">
                Built with security, privacy, and performance at its core. AdvisorNet 
                uses cutting-edge technology to protect your professional connections.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
              {techStack.map((tech, index) => (
                <div
                  key={tech.title}
                  className="p-8 rounded-xl border border-divider bg-surface-elevated animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <tech.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-medium text-foreground mb-2">
                    {tech.title}
                  </h3>
                  <p className="text-muted-foreground font-body">
                    {tech.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto mt-16 lg:mt-24 text-center">
              <h2 className="font-display text-2xl lg:text-3xl font-medium text-foreground mb-6">
                Compliance & Certifications
              </h2>
              <p className="text-muted-foreground font-body">
                AdvisorNet is compliant with GDPR, SOC 2 Type II, and ISO 27001 standards. 
                We take your privacy seriously and maintain the highest security standards.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
