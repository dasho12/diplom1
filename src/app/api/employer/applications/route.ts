import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Starting to fetch employer applications...");
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log("Authentication failed: No session or email");
      return NextResponse.json(
        { error: "Нэвтэрсэн байх шаардлагатай" },
        { status: 401 }
      );
    }

    console.log("User email:", session.user.email);

    // Get user with company info
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
        role: "EMPLOYER", // Ensure user is an employer
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      console.log("User not found or not an employer");
      return NextResponse.json(
        { error: "Ажил олгогч хэрэглэгч олдсонгүй" },
        { status: 404 }
      );
    }

    if (!user.company) {
      console.log("No company associated with user");
      return NextResponse.json(
        { error: "Таны компани олдсонгүй. Эхлээд компани бүртгүүлнэ үү." },
        { status: 404 }
      );
    }

    console.log("Fetching applications for company:", user.company.id);

    // Get all applications for jobs posted by this company
    const applications = await prisma.jobApplication.findMany({
      where: {
        job: {
          companyId: user.company.id,
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        cv: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Found ${applications.length} total applications`);

    // Filter out applications without CV data
    const validApplications = applications.filter(
      (app) => app.cv && app.cv.fileUrl
    );
    console.log(`Found ${validApplications.length} valid applications with CV`);

    if (validApplications.length === 0) {
      console.log("No valid applications found");
      return NextResponse.json([]); // Return empty array instead of error
    }

    return NextResponse.json(validApplications);
  } catch (error) {
    console.error("Error in GET /api/employer/applications:", error);
    return NextResponse.json(
      { error: "Системийн алдаа гарлаа. Дараа дахин оролдоно уу." },
      { status: 500 }
    );
  }
}
