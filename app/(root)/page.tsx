import { CategoriesSection } from "@/components/LandingPage/CategoriesSection";
import { FeaturedEventsSection } from "@/components/LandingPage/FeaturedEventsSection";
import { getAllEvents } from "@/lib/actions/event.actions";
import { HeroSection } from "@/components/LandingPage/HeroSection";
import { HowItWorksSection } from "@/components/LandingPage/HowItWorksSection";
import { SearchParamProps } from "@/types";
import NewsletterSection from "@/components/LandingPage/NewsletterSection";
import SmoothScroll from "@/utils/smoothScroll";

export default async function Home({ searchParams }: SearchParamProps) {
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams.page) || 1;
  const searchText = (resolvedSearchParams.query as string) || "";
  const category = (resolvedSearchParams.category as string) || "";
  const location = (resolvedSearchParams.location as string) || "";
  const limit = resolvedSearchParams.limit
    ? Number(resolvedSearchParams.limit)
    : 6;

  const events = await getAllEvents({
    query: searchText,
    category,
    page,
    location,
    limit: limit,
  });

  return (
    <>
      <SmoothScroll>
        <HeroSection />
        <CategoriesSection />
        <FeaturedEventsSection data={events?.data} />
        <HowItWorksSection />
        <NewsletterSection />
      </SmoothScroll>
    </>
  );
}
