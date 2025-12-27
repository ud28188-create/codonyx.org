import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-forest.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Forest aerial view representing growth and connection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 pt-20">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-background leading-tight mb-4 animate-fade-in">
            Connect. Collaborate.
            <br />
            <span className="italic">Innovate.</span>
          </h1>
          <p className="text-lg md:text-xl text-background/80 mb-2 animate-fade-in-delayed font-body">
            Since 2018
          </p>
          <p className="text-base md:text-lg text-background/70 mb-8 animate-fade-in-delayed font-body max-w-lg">
            An exclusive network uniting world-class advisors and cutting-edge laboratories 
            to drive breakthrough innovations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delayed">
            <Link to="/about">
              <Button variant="hero" size="xl">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
