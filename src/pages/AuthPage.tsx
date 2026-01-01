import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Target, MessageCircle, Handshake, Loader2 } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Exclusive Network",
    description: "Access a curated community of verified professionals",
  },
  {
    icon: MessageCircle,
    title: "Direct Connections",
    description: "Connect with advisors and laboratories worldwide",
  },
  {
    icon: Handshake,
    title: "Private Collaboration",
    description: "Secure environment for confidential partnerships",
  },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is approved
        const { data: profile } = await supabase
          .from("profiles")
          .select("approval_status")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (profile?.approval_status === "approved") {
          navigate("/dashboard");
        } else if (profile?.approval_status === "pending") {
          await supabase.auth.signOut();
          toast({
            title: "Pending Approval",
            description: "Your account is still pending admin approval.",
          });
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Check approval status
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("approval_status")
              .eq("user_id", session.user.id)
              .maybeSingle();

            if (profile?.approval_status === "approved") {
              navigate("/dashboard");
            } else if (profile?.approval_status === "pending") {
              await supabase.auth.signOut();
              toast({
                title: "Pending Approval",
                description: "Your account is still pending admin approval.",
              });
            } else if (profile?.approval_status === "rejected") {
              await supabase.auth.signOut();
              toast({
                title: "Access Denied",
                description: "Your registration request was rejected.",
                variant: "destructive",
              });
            }
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Check approval status
        const { data: profile } = await supabase
          .from("profiles")
          .select("approval_status")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (!profile) {
          await supabase.auth.signOut();
          toast({
            title: "Profile not found",
            description: "Please complete your registration first.",
            variant: "destructive",
          });
          return;
        }

        if (profile.approval_status === "pending") {
          await supabase.auth.signOut();
          toast({
            title: "Pending Approval",
            description: "Your account is still pending admin approval. You'll receive an email once approved.",
          });
          return;
        }

        if (profile.approval_status === "rejected") {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "Your registration request was rejected.",
            variant: "destructive",
          });
          return;
        }

        // User is approved - navigate to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12 bg-background">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <Link to="/" className="inline-block mb-12">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-8 h-8 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L12 8" />
                <path d="M12 8C8 8 5 11 5 15C5 19 8 22 12 22C16 22 19 19 19 15C19 11 16 8 12 8Z" />
                <path d="M8 8L4 4" />
                <path d="M16 8L20 4" />
              </svg>
            </div>
          </Link>

          <h1 className="font-display text-3xl lg:text-4xl font-medium text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground font-body mb-8">
            Advisors and Laboratories can sign in below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
              >
                Forgot password
              </button>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-8 text-xs text-center text-muted-foreground">
            Access is by invitation only. Contact your network administrator for an invite.
          </p>
        </div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:flex w-1/2 bg-foreground text-background p-12 xl:p-16 flex-col justify-center">
        <div className="max-w-md">
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 group cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-background/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-background" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg font-medium">{feature.title}</h3>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-background/70 text-sm font-body">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
