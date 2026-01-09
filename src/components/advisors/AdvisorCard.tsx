import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface AdvisorCardProps {
  id: string;
  fullName: string;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  organisation?: string | null;
  avatarUrl?: string | null;
  mentoringAreas?: string | null;
}

export function AdvisorCard({
  id,
  fullName,
  headline,
  bio,
  location,
  organisation,
  avatarUrl,
  mentoringAreas,
}: AdvisorCardProps) {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Parse mentoring areas into array
  const mentoringTags = mentoringAreas
    ? mentoringAreas.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const displayTags = mentoringTags.slice(0, 3);
  const remainingCount = mentoringTags.length - 3;

  return (
    <Card 
      className="group overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-divider bg-background cursor-pointer"
      onClick={() => navigate(`/profile/${id}`)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        
        {location && (
          <Badge 
            variant="secondary" 
            className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm text-foreground"
          >
            <MapPin className="w-3 h-3 mr-1" />
            {location}
          </Badge>
        )}
      </div>

      <CardContent className="p-5">
        <h3 className="font-heading text-xl font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {fullName}
        </h3>
        
        {headline && (
          <p className="text-sm text-primary font-medium mb-2 line-clamp-1">
            {headline}
          </p>
        )}
        
        {organisation && (
          <p className="text-sm text-muted-foreground mb-3">
            {organisation}
          </p>
        )}
        
        {bio && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {bio}
          </p>
        )}

        {mentoringTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-divider">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Functional Areas for Mentoring
            </p>
            <div className="flex flex-wrap gap-1.5">
              {displayTags.map((tag, index) => {
                const colors = [
                  "bg-teal-400",
                  "bg-emerald-400",
                  "bg-amber-400",
                  "bg-sky-400",
                  "bg-rose-400",
                  "bg-violet-400",
                  "bg-orange-400",
                  "bg-lime-400",
                ];
                const colorClass = colors[index % colors.length];
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={`text-xs px-2 py-0.5 ${colorClass} text-black font-medium hover:opacity-90`}
                  >
                    {tag}
                  </Badge>
                );
              })}
              {remainingCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 bg-muted text-foreground"
                >
                  +{remainingCount}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
