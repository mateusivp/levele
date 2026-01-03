"use client";

import { useEffect } from "react";

export default function AnalyticsTracker() {
  useEffect(() => {
    // Evita contar visitas em desenvolvimento se necessário, ou conta sempre
    fetch("/api/analytics", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
