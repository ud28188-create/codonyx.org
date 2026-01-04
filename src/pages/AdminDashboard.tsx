import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Check, X, User, Building2, Phone, Mail, MapPin, Clock, Link2, Copy, Plus, Trash2 } from "lucide-react";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface InviteToken {
  id: string;
  token: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  used_by: string | null;
}

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [inviteTokens, setInviteTokens] = useState<InviteToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [creatingToken, setCreatingToken] = useState(false);
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
    fetchInviteTokens();
  };

  const fetchInviteTokens = async () => {
    const { data, error } = await supabase
      .from("invite_tokens")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invite tokens:", error);
    } else {
      setInviteTokens(data || []);
    }
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

  const createInviteToken = async () => {
    setCreatingToken(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("invite_tokens")
      .insert({ created_by: user?.id })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create invite link.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Invite link created successfully.",
      });
      setInviteTokens(prev => [data, ...prev]);
    }
    setCreatingToken(false);
  };

  const deleteInviteToken = async (tokenId: string) => {
    const { error } = await supabase
      .from("invite_tokens")
      .delete()
      .eq("id", tokenId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete invite link.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Invite link deleted.",
      });
      setInviteTokens(prev => prev.filter(t => t.id !== tokenId));
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/register?inviteToken=${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard.",
    });
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

  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
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
      <DashboardNavbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-28">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage users and invite links
          </p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending Users</TabsTrigger>
            <TabsTrigger value="invites">Invite Links</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
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
          </TabsContent>

          <TabsContent value="invites">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Invite Links
                </CardTitle>
                <CardDescription>
                  Create and manage registration invite links. Each link expires in 7 days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={createInviteToken} disabled={creatingToken} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {creatingToken ? "Creating..." : "Create New Invite Link"}
                </Button>
              </CardContent>
            </Card>

            {inviteTokens.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No invite links created yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {inviteTokens.map((token) => {
                  const expired = isTokenExpired(token.expires_at);
                  const used = !!token.used_by;
                  
                  return (
                    <Card key={token.id} className={expired || used ? "opacity-60" : ""}>
                      <CardContent className="py-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Input
                                readOnly
                                value={`${window.location.origin}/register?inviteToken=${token.token}`}
                                className="font-mono text-sm flex-1 min-w-0"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyInviteLink(token.token)}
                                disabled={expired || used}
                                className="gap-2"
                              >
                                <Copy className="h-4 w-4" />
                                Copy
                              </Button>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Created: {formatDate(token.created_at)}</span>
                              <span>Expires: {formatDate(token.expires_at)}</span>
                              {expired && <Badge variant="destructive">Expired</Badge>}
                              {used && <Badge variant="secondary">Used</Badge>}
                              {!expired && !used && token.is_active && <Badge variant="default">Active</Badge>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteInviteToken(token.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
