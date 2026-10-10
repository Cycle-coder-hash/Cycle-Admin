import { useState, useEffect, useCallback } from "react";
import { services } from "../services";
import { OwnerProfileData } from "../pages/OwnerProfileCMS";

export const initialOwnerProfile: OwnerProfileData = {
  isVisible: true,
  name: "Al-Amin Islam",
  role: "Founder & Lead Institutional Analyst",
  roleBn: "প্রতিষ্ঠাতা ও প্রধান ইন্সটিটিউশনাল অ্যানালিস্ট",
  bioEn: "Specializing in institutional price delivery, market structure, liquidity dynamics, and price action. Dedicated to replacing emotional speculation with structured understanding, systematic analysis, and disciplined execution.",
  bioBn: "ইন্সটিটিউশনাল প্রাইস ডেলিভারি, মার্কেট স্ট্রাকচার, লিকুইডিটি ডায়নামিক্স এবং প্রাইস অ্যাকশন স্পেশালিস্ট। আবেগতাড়িত অনুমান দূর করে স্ট্রাকচার্ড আন্ডারস্ট্যান্ডিং, সিস্টেমেটিক অ্যানালাইসিস এবং সুশৃঙ্খল এক্সিকিউশন তৈরিতে প্রতিশ্রুতিবদ্ধ।",
  detailsEn: "Over 6+ years of specialized market experience researching interbank price delivery algorithms, session manipulation cycles, and institutional risk management.",
  detailsBn: "",
  photoUrl: "/logo.jpg",
  experienceYears: "6+ Years",
  studentsCount: "1,500+",
  tradingStyle: "Institutional Order Flow, Liquidity & (SMC)",
  signatureQuoteEn: "Before you trade, understand trading. Before you deposit, understand trading.",
  signatureQuoteBn: "ট্রেড করার আগে ট্রেডিং বুঝুন। ডিপোজিট করার আগে ট্রেডিং বুঝুন।",
  telegram: "https://t.me/cycleofchart",
  tiktok: "https://tiktok.com/@cycleofchart",
  youtube: "https://youtube.com/@cycleofchart",
  instagram: "https://instagram.com/cycleofchart",
  twitter: "https://x.com/cycleofchart",
  facebook: "https://facebook.com/cycleofchart",
  email: "contact@cycleofchart.com",
  showExperienceCard: false,
  experienceLabel: "Market Experience",
  experienceIcon: "clock",
  showMentoredCard: false,
  mentoredLabel: "Traders Mentored",
  mentoredIcon: "users",
  showMethodologyCard: true,
  methodologyLabel: "Core Methodology",
  methodologyIcon: "award",
  showDetailsParagraph: false,
  profile2Name: "Cycle of Chart",
  profile2Role: "Institutional Trading Mentor",
  profile2RoleBn: "ইন্সটিটিউশনাল ট্রেডিং মেন্টর",
  profile2PhotoUrl: "/logo.jpg",
  profile2BioEn: "Cycle of Chart is an institutional trading education and market research initiative committed to mentoring traders in SMC, liquidity engineering, and rule-based execution.",
  profile2BioBn: "সাইকেল অব চার্ট একটি প্রাতিষ্ঠানিক ট্রেডিং শিক্ষা ও মার্কেট রিসার্চ প্ল্যাটফর্ম যা এসএমসি, লিকুইডিটি ইঞ্জিনিয়ারিং এবং নিয়মতান্ত্রিক এক্সিকিউশনে ট্রেডারদের প্রশিক্ষণ দেয়।",
  profile2TradingStyle: "SMC, Liquidity & Order Flow Delivery",
  profile2Telegram: "https://t.me/cycleofchart",
  profile2Youtube: "https://youtube.com/@cycleofchart",
  profile2Facebook: "https://facebook.com/cycleofchart",
  profile2Twitter: "",
  profile2Email: "contact@cycleofchart.com",
};

export interface UseOwnerProfileReturn {
  profile: OwnerProfileData;
  isSaving: boolean;
  loading: boolean;
  saveProfile: (data: OwnerProfileData) => Promise<boolean>;
  reload: () => Promise<void>;
  actionMessage: string | null;
  clearActionMessage: () => void;
}

export function useOwnerProfile(): UseOwnerProfileReturn {
  const [profile, setProfile] = useState<OwnerProfileData>(initialOwnerProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await services.ownerProfile.fetchProfile();
      if (data) {
        setProfile((prev: OwnerProfileData) => ({ ...prev, ...data }));
      }
    } catch (err: any) {
      console.warn("[useOwnerProfile load error]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveProfile = useCallback(async (data: OwnerProfileData) => {
    try {
      setIsSaving(true);
      const updated = await services.ownerProfile.updateProfile(data);
      setProfile(updated || data);
      setActionMessage("Owner profile updated! Public site live preview reflects changes.");
      setTimeout(() => setActionMessage(null), 4000);
      return true;
    } catch (err: any) {
      alert("Failed to save owner profile: " + err.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    profile,
    isSaving,
    loading,
    saveProfile,
    reload,
    actionMessage,
    clearActionMessage: () => setActionMessage(null),
  };
}
