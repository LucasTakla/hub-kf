import type { ApplicationRecord, Deal, OfferRecord } from "./types";

function daysBetween(from: string, to: Date = new Date()) {
  const start = new Date(from);
  return Math.max(0, Math.floor((to.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function daysUntil(date: string) {
  const target = new Date(date);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function flattenApplications(deals: Deal[]): ApplicationRecord[] {
  return deals.flatMap((deal) =>
    deal.applications.map((app) => ({
      ...app,
      dealId: deal.id,
      businessName: deal.businessName,
      dealOwner: deal.owner,
      fundingAmount: deal.fundingAmount,
      responseDays:
        app.responseDays ??
        (app.submissionDate && app.status !== "draft"
          ? daysBetween(app.submissionDate)
          : null),
    })),
  );
}

export function flattenOffers(deals: Deal[]): OfferRecord[] {
  return deals.flatMap((deal) =>
    deal.offers.map((offer) => ({
      ...offer,
      dealId: deal.id,
      businessName: deal.businessName,
      dealOwner: deal.owner,
      fundingAmount: deal.fundingAmount,
      daysUntilExpiry: daysUntil(offer.expirationDate),
    })),
  );
}

export function getDealsWithMultipleOffers(deals: Deal[]) {
  return deals.filter((d) => d.offers.length >= 2);
}
