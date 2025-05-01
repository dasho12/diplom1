import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    });

    if (!user || !user.company) {
      return NextResponse.json(
        { message: "Компанийн мэдээлэл олдсонгүй" },
        { status: 404 }
      );
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: user.company.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    });

    if (!user || !user.company) {
      return NextResponse.json(
        { message: "Компанийн мэдээлэл олдсонгүй" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, description, location, salary, requirements } = body;

    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        salary,
        requirements,
        status: JobStatus.ACTIVE,
        companyId: user.company.id,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { message: "Ажлын байр үүсгэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
