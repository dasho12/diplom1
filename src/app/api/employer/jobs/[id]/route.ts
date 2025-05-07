import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const jobId = params.id;

    // Check if the job exists and belongs to the employer
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: "Ажлын байр олдсонгүй" },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const jobId = params.id;

    // Check if the job exists and belongs to the employer
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: "Ажлын байр олдсонгүй" },
        { status: 404 }
      );
    }

    // Delete the job
    await prisma.job.delete({
      where: {
        id: jobId
      }
    });

    return NextResponse.json({ message: "Ажлын байр амжилттай устгагдлаа" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
} 