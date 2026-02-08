import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PublicationCard } from "./PublicationCard";
import { FileText } from "lucide-react";

interface Publication {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  publication_type: string;
  file_url: string | null;
  external_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfilePublicationsProps {
  profileId: string;
}

const getTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    paper: "Published Paper",
    presentation: "Presentation",
    report: "Report",
    thesis: "Thesis",
    article: "Article",
    patent: "Patent",
    other: "Other",
  };
  return types[type] || type;
};

export function ProfilePublications({ profileId }: ProfilePublicationsProps) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPublications(data as Publication[]);
      }
      setLoading(false);
    };
    load();
  }, [profileId]);

  if (loading) return null;
  if (publications.length === 0) return null;

  return (
    <div className="bg-background rounded-2xl border border-divider p-8 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Publications & Work
        </h2>
      </div>

      <div className="space-y-3">
        {publications.map((pub) => (
          <PublicationCard
            key={pub.id}
            publication={pub}
            getTypeLabel={getTypeLabel}
            isOwner={false}
          />
        ))}
      </div>
    </div>
  );
}