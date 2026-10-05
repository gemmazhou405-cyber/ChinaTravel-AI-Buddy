export type CampaignPartnerType = 'creator' | 'hotel' | 'hostel' | 'guide' | 'other';
export type CampaignLandingVariant = 'hostel' | 'visa' | 'first-trip';

export type CampaignPartner = {
  id: string;
  displayName: string;
  type: CampaignPartnerType;
  active: boolean;
  landingVariants: CampaignLandingVariant[];
};

const campaignPartners: CampaignPartner[] = [
  {
    id: 'chinaease',
    displayName: 'ChinaEase Buddy',
    type: 'other',
    active: true,
    landingVariants: ['hostel', 'visa', 'first-trip'],
  },
];

export function getCampaignPartner(
  partnerId: string | null | undefined,
  variant: CampaignLandingVariant,
): CampaignPartner | null {
  if (!partnerId || !/^[a-z0-9][a-z0-9._~-]{0,39}$/i.test(partnerId)) return null;
  return campaignPartners.find((partner) => (
    partner.active
    && partner.id === partnerId.toLowerCase()
    && partner.landingVariants.includes(variant)
  )) ?? null;
}
