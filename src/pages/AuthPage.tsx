import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Target, MessageCircle, Handshake } from "lucide-react";

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
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth functionality will be added when Cloud is enabled
    console.log("Auth submit:", { email, password });
  };

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
            {isLogin ? "Welcome back" : "Join AdvisorNet"}
          </h1>
          <p className="text-muted-foreground font-body mb-8">
            {isLogin
              ? "Advisors and Laboratories can sign in below."
              : "Create your account to join the network."}
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

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
                >
                  Forgot password
                </button>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full h-12 text-base">
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-divider text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? "Request Access" : "Sign In"}
              </button>
            </p>
          </div>

          <p className="mt-6 text-xs text-center text-muted-foreground">
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
