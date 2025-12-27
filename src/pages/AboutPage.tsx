import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="font-display text-4xl lg:text-5xl font-medium text-foreground mb-6 animate-fade-in">
                About AdvisorNet
              </h1>
              <div className="prose prose-lg max-w-none font-body text-muted-foreground space-y-6 animate-fade-in-delayed">
                <p className="text-xl leading-relaxed">
                  AdvisorNet is an exclusive, invite-only platform connecting elite advisors 
                  with pioneering laboratories across the globe.
                </p>
                <p>
                  Since 2018, we've built a trusted network where expertise meets innovation. 
                  Our carefully curated community includes industry veterans, scientific experts, 
                  and breakthrough research facilities united by a common goal: advancing 
                  knowledge and creating meaningful impact.
                </p>
                <p>
                  Unlike traditional networking platforms, AdvisorNet operates on trust and 
                  exclusivity. Every member is verified, every connection is meaningful, and 
                  every collaboration has the potential to change industries.
                </p>
                <h2 className="font-display text-2xl font-medium text-foreground mt-12 mb-4">
                  Our Mission
                </h2>
                <p>
                  To create a secure, private ecosystem where world-class expertise flows 
                  freely between advisors and laboratories, accelerating innovation and 
                  fostering partnerships that wouldn't otherwise be possible.
                </p>
                <h2 className="font-display text-2xl font-medium text-foreground mt-12 mb-4">
                  Our Values
                </h2>
                <ul className="space-y-3">
                  <li><strong className="text-foreground">Trust:</strong> Every member is verified and vouched for by the network.</li>
                  <li><strong className="text-foreground">Excellence:</strong> We curate only the highest caliber of professionals.</li>
                  <li><strong className="text-foreground">Privacy:</strong> Your connections and collaborations remain confidential.</li>
                  <li><strong className="text-foreground">Impact:</strong> We measure success by the breakthroughs we enable.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
