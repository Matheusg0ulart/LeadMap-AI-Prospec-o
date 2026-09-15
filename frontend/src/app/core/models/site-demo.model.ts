export interface DemoServiceItem {
  title: string;
  description: string;
  icon: string;
  tag: string;
}

export interface DemoTestimonial {
  author: string;
  comment: string;
  rating: number;
  timeAgo: string;
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
  primaryCta: string;
  theme: string;
  primaryColor: string;
  accentColor: string;
  aboutTitle: string;
  aboutText: string;
  services: DemoServiceItem[];
  highlights: string[];
  testimonials: DemoTestimonial[];
  businessHours: string;
}
