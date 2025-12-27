import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrendingUp, Globe, Users } from "lucide-react";

const investmentStats = [
  { icon: TrendingUp, number: "400+", label: "Portfolio Companies", description: "Diverse investments across sectors" },
  { icon: Globe, number: "70+", label: "Countries", description: "Global presence and reach" },
  { icon: Users, number: "$2B+", label: "Total Investments", description: "Capital deployed to date" },
];

export default function InvestmentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
              <h1 className="font-display text-4xl lg:text-5xl font-medium text-foreground mb-6 animate-fade-in">
                Our Investments
              </h1>
              <p className="text-lg text-muted-foreground font-body animate-fade-in-delayed">
                AdvisorNet connects laboratories with strategic investors and advisors 
                who bring more than capital—they bring expertise, networks, and vision.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {investmentStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center p-8 rounded-xl border border-divider bg-surface-elevated animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="font-display text-4xl font-semibold text-foreground mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider mb-2">
                    {stat.label}
                  </div>
                  <p className="text-sm text-muted-foreground font-body">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto mt-16 lg:mt-24">
              <h2 className="font-display text-2xl lg:text-3xl font-medium text-foreground mb-6 text-center">
                Investment Philosophy
              </h2>
              <div className="prose prose-lg max-w-none font-body text-muted-foreground space-y-4">
                <p>
                  We believe in long-term partnerships that go beyond financial returns. 
                  Our network of advisors provides strategic guidance, industry connections, 
                  and operational expertise to help laboratories scale their innovations.
                </p>
                <p>
                  Every investment decision is backed by our global network of expert advisors 
                  who bring deep domain knowledge and proven track records of success.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
