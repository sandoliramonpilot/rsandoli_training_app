import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Image as ImageIcon, Video, Loader2 } from "lucide-react";

export default function MediaThumb({ file_uri, file_type, file_name }) {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (file_type === "image" && file_uri) {
      setLoading(true);
      base44.integrations.Core.CreateFileSignedUrl({ file_uri })
        .then(({ signed_url }) => setSignedUrl(signed_url))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [file_uri, file_type]);

  if (file_type === "image") {
    if (loading) {
      return (
        <div className="w-10 h-10 rounded-lg bg-slate-700/40 flex items-center justify-center shrink-0">
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
        </div>
      );
    }
    if (signedUrl) {
      return (
        <img
          src={signedUrl}
          alt={file_name || "imagem técnica"}
          className="w-10 h-10 rounded-lg object-cover border border-slate-700/60 shrink-0"
        />
      );
    }
    return <ImageIcon className="w-4 h-4 text-sky-400 shrink-0" />;
  }

  if (file_type === "video") {
    return <Video className="w-4 h-4 text-purple-400 shrink-0" />;
  }

  return <FileText className="w-4 h-4 text-amber-400 shrink-0" />;
}