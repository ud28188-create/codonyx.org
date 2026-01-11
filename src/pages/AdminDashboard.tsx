import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Building2, Phone, Mail, MapPin, Clock, Link2, Copy, CalendarIcon, Power, Eye } from "lucide-react";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PendingUserDetailModal } from "@/components/admin/PendingUserDetailModal";

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
  approval_status: "pending" | "approved" | "rejected";
  avatar_url: string | null;
  company_type: string | null;
  linkedin_url: string | null;
  education: string | null;
  expertise: string | null;
  mentoring_areas: string | null;
  languages: string | null;
  industry_expertise: string | null;
  company_size: string | null;
  founded_year: number | null;
  website_url: string | null;
  services: string | null;
  research_areas: string | null;
}

interface InviteConfig {
  id: string;
  token: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  used_by: string | null;
}

const FIXED_INVITE_PATH = "/register?invite=codonyx-invite-2024";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allAdvisors, setAllAdvisors] = useState<PendingUser[]>([]);
  const [allLabs, setAllLabs] = useState<PendingUser[]>([]);
  const [inviteConfig, setInviteConfig] = useState<InviteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [expirationDate, setExpirationDate] = useState<Date>(addDays(new Date(), 7));
  const [saving, setSaving] = useState(false);
  const [advisorStatusFilter, setAdvisorStatusFilter] = useState<string>("all");
  const [labStatusFilter, setLabStatusFilter] = useState<string>("all");
  const [selectedPendingUser, setSelectedPendingUser] = useState<PendingUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    fetchInviteConfig();
    fetchAllUsers();
  };

  const fetchAllUsers = async () => {
    setUsersLoading(true);
    
    const { data: advisors } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_type", "advisor")
      .order("full_name");
    
    const { data: labs } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_type", "laboratory")
      .order("full_name");
    
    setAllAdvisors(advisors || []);
    setAllLabs(labs || []);
    setUsersLoading(false);
  };

  const fetchInviteConfig = async () => {
    const { data, error } = await supabase
      .from("invite_tokens")
      .select("*")
      .eq("token", "codonyx-invite-2024")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching invite config:", error);
    } else if (data) {
      setInviteConfig(data);
      setExpirationDate(new Date(data.expires_at));
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
      setIsModalOpen(false);
      setSelectedPendingUser(null);
    }
    setProcessingId(null);
  };

  const handleViewPendingUser = (user: PendingUser) => {
    setSelectedPendingUser(user);
    setIsModalOpen(true);
  };

  const saveInviteConfig = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (inviteConfig) {
      // Update existing config
      const { error } = await supabase
        .from("invite_tokens")
        .update({ 
          expires_at: expirationDate.toISOString(),
          is_active: true
        })
        .eq("id", inviteConfig.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update invite link.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Invite link settings saved.",
        });
        fetchInviteConfig();
      }
    } else {
      // Create new config with fixed token
      const { data, error } = await supabase
        .from("invite_tokens")
        .insert({ 
          created_by: user?.id,
          token: "codonyx-invite-2024",
          expires_at: expirationDate.toISOString(),
          is_active: true
        })
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
          description: "Invite link created and enabled.",
        });
        setInviteConfig(data);
      }
    }
    setSaving(false);
  };

  const toggleLinkStatus = async () => {
    if (!inviteConfig) return;

    const newStatus = !inviteConfig.is_active;
    const { error } = await supabase
      .from("invite_tokens")
      .update({ is_active: newStatus })
      .eq("id", inviteConfig.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update link status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Link ${newStatus ? "enabled" : "disabled"}.`,
      });
      setInviteConfig(prev => prev ? { ...prev, is_active: newStatus } : null);
    }
  };

  const copyInviteLink = () => {
    const baseUrl = websiteUrl.trim() || window.location.origin;
    const cleanUrl = baseUrl.replace(/\/$/, "");
    const link = `${cleanUrl}${FIXED_INVITE_PATH}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard.",
    });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  const isExpired = inviteConfig ? new Date(inviteConfig.expires_at) < new Date() : false;
  const isInvalid = inviteConfig ? (!inviteConfig.is_active || isExpired) : true;

  const getStatus = () => {
    if (!inviteConfig) return { label: "Not Created", variant: "outline" as const };
    if (!inviteConfig.is_active) return { label: "Disabled", variant: "outline" as const };
    if (isExpired) return { label: "Expired", variant: "destructive" as const };
    return { label: "Active", variant: "default" as const };
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  const status = getStatus();

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
            <TabsTrigger value="advisors">Advisors</TabsTrigger>
            <TabsTrigger value="labs">Laboratories</TabsTrigger>
            <TabsTrigger value="invites">Invite Link</TabsTrigger>
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
                  <Card 
                    key={user.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleViewPendingUser(user)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>{user.full_name.slice(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{user.full_name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </CardDescription>
                          </div>
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
                        <p className="text-sm text-foreground font-medium">{user.headline}</p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPendingUser(user);
                          }}
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <PendingUserDetailModal
              user={selectedPendingUser}
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedPendingUser(null);
              }}
              onApprove={(userId, profileId) => handleApproval(userId, profileId, true)}
              onReject={(userId, profileId) => handleApproval(userId, profileId, false)}
              isProcessing={processingId !== null}
            />
          </TabsContent>

          {/* Advisors Tab */}
          <TabsContent value="advisors">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Advisors</CardTitle>
                    <CardDescription>Manage all advisor accounts</CardDescription>
                  </div>
                  <Select value={advisorStatusFilter} onValueChange={setAdvisorStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading advisors...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Organisation</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allAdvisors
                        .filter(a => advisorStatusFilter === "all" || a.approval_status === advisorStatusFilter)
                        .map((advisor) => (
                        <TableRow key={advisor.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/profile/${advisor.id}`)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={advisor.avatar_url || undefined} />
                                <AvatarFallback>{advisor.full_name.slice(0,2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{advisor.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{advisor.email}</TableCell>
                          <TableCell>{advisor.organisation || "-"}</TableCell>
                          <TableCell>{advisor.location || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={
                              advisor.approval_status === "approved" ? "default" :
                              advisor.approval_status === "pending" ? "secondary" : "destructive"
                            } className="capitalize">
                              {advisor.approval_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{format(new Date(advisor.created_at), "MMM d, yyyy")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Laboratories Tab */}
          <TabsContent value="labs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Laboratories</CardTitle>
                    <CardDescription>Manage all laboratory accounts</CardDescription>
                  </div>
                  <Select value={labStatusFilter} onValueChange={setLabStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading laboratories...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allLabs
                        .filter(l => labStatusFilter === "all" || l.approval_status === labStatusFilter)
                        .map((lab) => (
                        <TableRow key={lab.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/profile/${lab.id}`)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={lab.avatar_url || undefined} />
                                <AvatarFallback>{lab.full_name.slice(0,2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{lab.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{lab.email}</TableCell>
                          <TableCell>{lab.company_type || "-"}</TableCell>
                          <TableCell>{lab.location || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={
                              lab.approval_status === "approved" ? "default" :
                              lab.approval_status === "pending" ? "secondary" : "destructive"
                            } className="capitalize">
                              {lab.approval_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{format(new Date(lab.created_at), "MMM d, yyyy")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Invite Link Configuration
                </CardTitle>
                <CardDescription>
                  Configure the registration invite link with expiration date and enable/disable it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fixed Invite Path Display */}
                <div className="space-y-2">
                  <Label>Invite Link</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="max-w-[250px]"
                    />
                    <span className="text-sm font-mono text-muted-foreground bg-muted px-3 py-2 rounded-md">
                      {FIXED_INVITE_PATH}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyInviteLink}
                      disabled={isInvalid}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your website URL to generate the full invite link.
                  </p>
                </div>

                {/* Status Display */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {isInvalid && inviteConfig && (
                        <span className="text-sm text-destructive font-medium">Invalid Link</span>
                      )}
                    </div>
                    {inviteConfig && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Expires: {formatDate(inviteConfig.expires_at)}
                      </p>
                    )}
                  </div>
                  {inviteConfig && (
                    <Button
                      variant={inviteConfig.is_active ? "outline" : "default"}
                      size="sm"
                      onClick={toggleLinkStatus}
                      className="gap-2"
                    >
                      <Power className="h-4 w-4" />
                      {inviteConfig.is_active ? "Disable" : "Enable"}
                    </Button>
                  )}
                </div>

                {/* Expiration Date Picker */}
                <div className="space-y-2">
                  <Label>Expiration Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !expirationDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expirationDate ? format(expirationDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={expirationDate}
                        onSelect={(date) => date && setExpirationDate(date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Save Button */}
                <Button 
                  onClick={saveInviteConfig} 
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? "Saving..." : inviteConfig ? "Save Changes" : "Create & Enable Link"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
