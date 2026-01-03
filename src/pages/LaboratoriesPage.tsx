import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { Footer } from "@/components/layout/Footer";
import { AdvisorCard } from "@/components/advisors/AdvisorCard";
import { AdvisorFilters } from "@/components/advisors/AdvisorFilters";
import { Loader2, Building2 } from "lucide-react";

interface Laboratory {
  id: string;
  full_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  organisation: string | null;
  avatar_url: string | null;
}

export default function LaboratoriesPage() {
  const navigate = useNavigate();
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    const checkAuthAndLoadLaboratories = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is approved
      const { data: profile } = await supabase
        .from("profiles")
        .select("approval_status")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profile?.approval_status !== "approved") {
        navigate("/auth");
        return;
      }

      // Load approved laboratories
      const { data: laboratoriesData } = await supabase
        .from("profiles")
        .select("id, full_name, headline, bio, location, organisation, avatar_url")
        .eq("user_type", "laboratory")
        .eq("approval_status", "approved")
        .order("full_name");

      if (laboratoriesData) {
        setLaboratories(laboratoriesData);
      }
      setIsLoading(false);
    };

    checkAuthAndLoadLaboratories();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    const locations = laboratories
      .map((l) => l.location)
      .filter((loc): loc is string => !!loc);
    return [...new Set(locations)].sort();
  }, [laboratories]);

  // Filter laboratories
  const filteredLaboratories = useMemo(() => {
    return laboratories.filter((lab) => {
      const matchesSearch =
        !searchQuery ||
        lab.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.organisation?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation =
        !locationFilter ||
        locationFilter === "all" ||
        lab.location === locationFilter;

      return matchesSearch && matchesLocation;
    });
  }, [laboratories, searchQuery, locationFilter]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setLocationFilter("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <DashboardNavbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl lg:text-4xl font-medium text-foreground mb-2">
              Laboratory Network
            </h1>
            <p className="text-muted-foreground">
              Connect with verified laboratories from around the world
            </p>
          </div>

          {/* Filters */}
          <AdvisorFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            locationFilter={locationFilter}
            onLocationChange={setLocationFilter}
            locations={uniqueLocations}
            onClearFilters={handleClearFilters}
          />

          {/* Results Count */}
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span>
              {filteredLaboratories.length} laborator{filteredLaboratories.length !== 1 ? "ies" : "y"} found
            </span>
          </div>

          {/* Laboratory Grid */}
          {filteredLaboratories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLaboratories.map((lab) => (
                <AdvisorCard
                  key={lab.id}
                  fullName={lab.full_name}
                  headline={lab.headline}
                  bio={lab.bio}
                  location={lab.location}
                  organisation={lab.organisation}
                  avatarUrl={lab.avatar_url}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                No laboratories found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
