import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Fetching employer applications...");
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user);

    if (!session?.user?.email) {
      console.log("No session or email found");
      return NextResponse.json(
        { error: "Нэвтэрсэн байх шаардлагатай" },
        { status: 401 }
      );
    }

    // First get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        company: true,
      },
    });

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json(
        { error: "Хэрэглэгч олдсонгүй" },
        { status: 404 }
      );
    }

    if (!user.company) {
      console.log("User has no company");
      return NextResponse.json(
        { error: "Таны компани олдсонгүй" },
        { status: 404 }
      );
    }

    console.log("Found company:", user.company.id);

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

    // Filter out applications without CV data at the database level
    const validApplications = applications.filter(
      (app) => app.cv && app.cv.fileUrl
    );

    console.log("Found applications:", validApplications.length);
    return NextResponse.json(validApplications);
  } catch (error) {
    console.error("Error in GET /api/employer/applications:", error);
    return NextResponse.json(
      { error: "Өргөдлүүдийг ачаалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
