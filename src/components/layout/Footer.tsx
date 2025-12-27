import { Link } from "react-router-dom";
import { Linkedin, Twitter, Youtube } from "lucide-react";

const footerLinks = {
  platform: [
    { name: "Investments", href: "/investments" },
    { name: "Product", href: "/product" },
    { name: "Technology", href: "/technology" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};

const socialLinks = [
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-background border-t border-divider">
      <div className="container mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl font-semibold text-foreground tracking-tight">
                AdvisorNet
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              A private network connecting elite advisors and laboratories worldwide.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
              Platform
            </h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Social */}
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
              Connect
            </h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-divider flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Copyright © {new Date().getFullYear()} AdvisorNet. All rights reserved.
          </p>
          <Link
            to="/privacy"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
