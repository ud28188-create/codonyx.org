import { StatCard } from "./StatCard";

const stats = [
  { number: "400+", label: "Investments" },
  { number: "70+", label: "Countries" },
  { number: "1,000+", label: "Advisors" },
];

export function StatsSection() {
  return (
    <section className="relative z-20 -mt-24 pb-16 lg:pb-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-center lg:justify-end">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 max-w-3xl">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                number={stat.number}
                label={stat.label}
                delay={`${index * 0.1}s`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
