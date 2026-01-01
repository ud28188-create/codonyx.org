import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, User, Building2, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface PendingUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  contact_number: string | null;
  organisation: string | null;
  user_type: "advisor" | "laboratory";
  created_at: string;
  location: string | null;
  headline: string | null;
  bio: string | null;
}

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user is admin using the has_role function
    const { data: hasAdminRole, error } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (error || !hasAdminRole) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    fetchPendingUsers();
  };

  const fetchPendingUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pending users.",
        variant: "destructive",
      });
    } else {
      setPendingUsers(data || []);
    }
    setLoading(false);
  };

  const handleApproval = async (userId: string, profileId: string, approve: boolean) => {
    setProcessingId(profileId);
    
    const { error } = await supabase
      .from("profiles")
      .update({ approval_status: approve ? "approved" : "rejected" })
      .eq("id", profileId);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${approve ? "approve" : "reject"} user.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `User has been ${approve ? "approved" : "rejected"}.`,
      });
      setPendingUsers(prev => prev.filter(u => u.id !== profileId));
    }
    setProcessingId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage pending user registrations
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading pending users...</p>
          </div>
        ) : pendingUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No pending registrations.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingUsers.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{user.full_name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={user.user_type === "advisor" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {user.user_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    {user.organisation && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{user.organisation}</span>
                      </div>
                    )}
                    {user.contact_number && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{user.contact_number}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(user.created_at)}</span>
                    </div>
                  </div>

                  {user.headline && (
                    <p className="text-sm text-foreground">{user.headline}</p>
                  )}

                  {user.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleApproval(user.user_id, user.id, true)}
                      disabled={processingId === user.id}
                      className="flex-1"
                      size="sm"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleApproval(user.user_id, user.id, false)}
                      disabled={processingId === user.id}
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
