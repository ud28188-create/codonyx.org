import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "For Advisors",
    description: "Join our exclusive network of industry experts providing strategic guidance to innovative laboratories.",
    link: "/about",
  },
  {
    title: "For Laboratories",
    description: "Access world-class advisors who can accelerate your research and open doors to new opportunities.",
    link: "/about",
  },
];

export function MissionSection() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
          <h2 className="font-display text-3xl lg:text-4xl font-medium text-foreground mb-6">
            Building bridges between expertise and innovation
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed font-body">
            AdvisorNet connects elite advisors with pioneering laboratories, 
            creating a private ecosystem where knowledge flows freely and 
            groundbreaking partnerships are formed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="group p-8 rounded-xl border border-divider bg-surface-elevated hover:border-primary/30 hover:shadow-card transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-display text-xl font-medium text-foreground">
                  {feature.title}
                </h3>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-muted-foreground font-body leading-relaxed">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
