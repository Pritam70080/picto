"use client";

import { MotionConfig } from "motion/react";
import { FeatureSection, StoryIntro } from "@/components/landing/feature-section";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingLoading } from "@/components/landing/landing-loading";
import { LandingNav } from "@/components/landing/landing-nav";
import { TransformationSection } from "@/components/landing/transformation-section";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { isReady } = useAuth();

  return (
    <MotionConfig reducedMotion="user">
      {isReady ? (
        <div className="landing-scrollbar h-full overflow-y-auto bg-background text-foreground">
          <LandingNav />
          <main>
            <LandingHero />
            <StoryIntro />
            <FeatureSection />
            <TransformationSection />
            <LandingCta />
          </main>
          <LandingFooter />
        </div>
      ) : (
        <LandingLoading />
      )}
    </MotionConfig>
  );
}
