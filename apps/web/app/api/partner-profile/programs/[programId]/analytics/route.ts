import { getAnalytics } from "@/lib/analytics/get-analytics";
import { getProgramEnrollmentOrThrow } from "@/lib/api/programs/get-program-enrollment-or-throw";
import { withPartnerProfile } from "@/lib/auth/partner";
import { analyticsQuerySchema } from "@/lib/zod/schemas/analytics";
import { prisma } from "@dub/prisma";
import { NextResponse } from "next/server";

// GET /api/partner-profile/programs/[programId]/analytics – get analytics for a program enrollment link
export const GET = withPartnerProfile(
  async ({ partner, params, searchParams }) => {
    const { program } = await getProgramEnrollmentOrThrow({
      partnerId: partner.id,
      programId: params.programId,
    });

    const parsedParams = analyticsQuerySchema
      .pick({
        event: true,
        groupBy: true,
        linkId: true,
        domain: true,
        key: true,
        interval: true,
        start: true,
        end: true,
        timezone: true,
      })
      .parse(searchParams);

    let { linkId, domain, key, ...rest } = parsedParams;

    if (!linkId && domain && key) {
      const link = await prisma.link.findUnique({
        where: {
          domain_key: {
            domain,
            key,
          },
        },
      });

      if (!link || link.partnerId !== partner.id) {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
      }

      linkId = link.id;
    }

    const response = await getAnalytics({
      ...rest,
      programId: program.id,
      partnerId: partner.id,
      linkId,
      dataAvailableFrom: program.createdAt,
    });

    return NextResponse.json(response);
  },
);
