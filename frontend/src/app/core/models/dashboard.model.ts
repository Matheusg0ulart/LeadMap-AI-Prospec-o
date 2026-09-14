export interface DashboardSummary {
  totalBusinessesFound: number;
  opportunitiesWithoutWebsite: number;
  savedLeads: number;
  contactedLeads: number;
  conversions: number;
  leadsByCategory: { [key: string]: number };
  funnel: { [key: string]: number };
  scoreDistribution: { [key: string]: number };
}
