"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import ScoreEntry from "../../../components/dashboard/ScoreEntry";
import { useAuth } from "../../../components/AuthProvider";

export default function ScoresPage() {
  const { user } = useAuth();
  const router = useRouter();
  if (!user) return null;
  return <ScoreEntry userId={user.id} onScoreAdded={() => router.push("/dashboard")} />;
}