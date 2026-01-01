import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface Profile {
  full_name: string;
  email: string;
  user_type: string;
  organisation: string | null;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, user_type, organisation")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }
      setIsLoading(false);
    };

    checkAuthAndLoadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-background rounded-2xl p-8 shadow-sm border border-divider">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="font-display text-3xl font-medium text-foreground mb-2">
                    Welcome, {profile?.full_name}!
                  </h1>
                  <p className="text-muted-foreground">
                    You're logged in as a{" "}
                    <span className="capitalize font-medium text-primary">
                      {profile?.user_type}
                    </span>
                    {profile?.organisation && (
                      <> at {profile.organisation}</>
                    )}
                  </p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>

              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                <h2 className="font-display text-lg font-medium text-foreground mb-2">
                  Your Dashboard is Ready
                </h2>
                <p className="text-muted-foreground text-sm">
                  Full profile editing, posts, member search, and connection features will be available soon. 
                  Your account has been approved and you now have access to the AdvisorNet platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
