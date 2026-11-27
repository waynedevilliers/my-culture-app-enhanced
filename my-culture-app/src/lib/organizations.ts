// Organisation queries and response shapes. The moved UI reads the logo as
// `organization.Image.url` (the old Sequelize association name).

import type { Prisma } from '@prisma/client';

/** Fields anyone may see, for published and approved organisations. */
export const publicOrganizationSelect = {
  id: true,
  name: true,
  description: true,
  website: true,
  phone: true,
  email: true,
  published: true,
  createdAt: true,
  logo: { select: { id: true, url: true } },
} satisfies Prisma.OrganizationSelect;

/** Fields for the dashboard. */
export const adminOrganizationSelect = {
  ...publicOrganizationSelect,
  approvalStatus: true,
  approvedAt: true,
  rejectedAt: true,
  rejectionNotes: true,
  contactPerson: true,
  adminName: true,
  adminEmail: true,
  applicationDetails: true,
  updatedAt: true,
} satisfies Prisma.OrganizationSelect;

/** Only organisations that are approved and published are public. */
export const publicOrganizationWhere = {
  published: true,
  approvalStatus: 'approved',
} satisfies Prisma.OrganizationWhereInput;

type WithLogo = { logo: { id: string; url: string } | null };

/** Rename `logo` to the `Image` key the UI expects. */
export function withImage<T extends WithLogo>(organization: T) {
  const { logo, ...rest } = organization;
  return { ...rest, Image: logo };
}
