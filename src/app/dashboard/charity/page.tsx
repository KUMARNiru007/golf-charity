"use client";
import * as React from "react";
import CharitySelection from "../../../components/dashboard/CharitySelection";
import { useAuth } from "../../../components/AuthProvider";

export default function CharityPage() {
  const { profile } = useAuth();
  if (!profile) return null;
  return <CharitySelection profile={profile} />;
}