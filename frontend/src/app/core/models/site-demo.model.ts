export interface DemoServiceItem {
  title: string;
  description: string;
  icon: string;
  tag?: string;
  priceBadge?: string;
}

export interface DemoPillar {
  title: string;
  description: string;
  icon: string;
}

export interface DemoTestimonial {
  author: string;
  comment: string;
  rating: number;
  timeAgo: string;
}

export interface DemoFaq {
  question: string;
  answer: string;
  open?: boolean;
}

export interface SiteDemo {
  businessId: number;
  businessName: string;
  category: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  rating: number;
  reviewCount: number;
  instagram?: string;
  suggestedDomain?: string;
  domainAvailable?: boolean;
  demoUrl: string;
  whatsappPitchWithDemo: string;

  headline: string;
  subheadline: string;
  slogan?: string;
  primaryCta: string;
  theme: string;
  primaryColor: string;
  accentColor: string;
  heroImageUrl?: string;
  galleryImages?: string[];
  aboutTitle: string;
  aboutText: string;
  services: DemoServiceItem[];
  pillars?: DemoPillar[];
  highlights: string[];
  testimonials: DemoTestimonial[];
  faqs?: DemoFaq[];
  businessHours: string;
  aiPowered?: boolean;
}

