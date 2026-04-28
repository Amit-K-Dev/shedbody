"use client";

import { useEffect, useState } from "react";
import ShareArticle from "@/components/ShareArticle";

export default function ShareArticleClient(props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ShareArticle {...props} />;
}
