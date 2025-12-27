interface StatCardProps {
  number: string;
  label: string;
  delay?: string;
}

export function StatCard({ number, label, delay = "0s" }: StatCardProps) {
  return (
    <div 
      className="bg-background rounded-lg p-6 lg:p-8 shadow-card text-center animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div className="font-display text-4xl lg:text-5xl font-semibold text-foreground mb-2">
        {number}
      </div>
      <div className="text-sm text-muted-foreground uppercase tracking-wider font-body">
        {label}
      </div>
    </div>
  );
}
