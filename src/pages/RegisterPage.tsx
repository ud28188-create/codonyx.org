import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Target, MessageCircle, Handshake, CheckCircle, Loader2, XCircle } from "lucide-react";

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

type UserType = "advisor" | "laboratory";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteToken = searchParams.get("invite");

  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [userType, setUserType] = useState<UserType>("advisor");

  // Validate invite token
  useEffect(() => {
    const validateToken = async () => {
      if (!inviteToken) {
        setIsValidatingToken(false);
        setIsTokenValid(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("invite_tokens")
          .select("id, is_active, expires_at, used_at")
          .eq("token", inviteToken)
          .maybeSingle();

        if (error || !data) {
          setIsTokenValid(false);
        } else if (!data.is_active) {
          setIsTokenValid(false);
        } else if (data.used_at) {
          setIsTokenValid(false);
        } else if (new Date(data.expires_at) < new Date()) {
          setIsTokenValid(false);
        } else {
          setIsTokenValid(true);
          setTokenId(data.id);
        }
      } catch {
        setIsTokenValid(false);
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [inviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) {
        toast({
          title: "Registration failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Registration failed",
          description: "Could not create user account.",
          variant: "destructive",
        });
        return;
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authData.user.id,
        full_name: fullName,
        email: email,
        contact_number: contactNumber || null,
        organisation: organisation || null,
        user_type: userType,
        approval_status: "pending",
        invite_token_id: tokenId,
      });

      if (profileError) {
        console.error("Profile error:", profileError);
        toast({
          title: "Profile creation failed",
          description: "Your account was created but profile setup failed. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Sign out immediately (user needs approval)
      await supabase.auth.signOut();

      setIsRegistered(true);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  // Invalid or no token
  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-medium text-foreground mb-3">
            Invalid Invitation
          </h1>
          <p className="text-muted-foreground mb-6">
            This invitation link is invalid, expired, or has already been used. 
            Please contact your network administrator for a new invitation.
          </p>
          <Link to="/">
            <Button variant="outline">Return to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Registration success
  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-medium text-foreground mb-3">
            Registration Submitted
          </h1>
          <p className="text-muted-foreground mb-2">
            Thank you for registering with AdvisorNet.
          </p>
          <p className="text-muted-foreground mb-6">
            Your request is currently <span className="text-amber-600 font-medium">pending admin approval</span>. 
            You will receive an email once your account has been approved.
          </p>
          <Link to="/">
            <Button variant="primary">Return to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12 bg-background overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <Link to="/" className="inline-block mb-8">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6 text-primary-foreground"
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
            Join AdvisorNet
          </h1>
          <p className="text-muted-foreground font-body mb-8">
            Complete your registration to join the network.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs uppercase tracking-wider font-medium">
                Full Name *
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider font-medium">
                Email *
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider font-medium">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider font-medium">
                  Confirm *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber" className="text-xs uppercase tracking-wider font-medium">
                Contact Number
              </Label>
              <Input
                id="contactNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organisation" className="text-xs uppercase tracking-wider font-medium">
                Organisation / Company
              </Label>
              <Input
                id="organisation"
                type="text"
                placeholder="Enter your organisation"
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider font-medium">
                I am a *
              </Label>
              <RadioGroup
                value={userType}
                onValueChange={(value) => setUserType(value as UserType)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advisor" id="advisor" />
                  <Label htmlFor="advisor" className="font-normal cursor-pointer">
                    Advisor
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="laboratory" id="laboratory" />
                  <Label htmlFor="laboratory" className="font-normal cursor-pointer">
                    Laboratory
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full h-12 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                "Submit Registration"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-divider text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
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
