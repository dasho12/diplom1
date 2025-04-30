import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    console.log('Fetching jobs...');
    
    // Check if we have any jobs
    const jobs = await prisma.job.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Found jobs:', jobs.length);

    // If no jobs exist, create sample jobs
    if (jobs.length === 0) {
      console.log('No jobs found, creating sample jobs...');
      const sampleJobs = [
        {
          title: 'Маркетингийн Менежер',
          company: 'Tech Corp',
          description: 'Маркетингийн менежер ажилд авна. Бид таныг манай багт нэгдэхийг хүсч байна.',
          requirements: '3-5 жилийн маркетингийн туршлага, сошиал медиа, цахим маркетинг мэдлэгтэй, бүтээлч сэтгэлгээ, багийн ажил, баг удирдах чадвар, англи хэл мэдлэг (туслах), судалгаа хийх, хэрэглэгчийн зан төлөв ойлгох чадвартай байх',
          location: 'Улаанбаатар',
          salary: '₮3,000,000 - ₮5,000,000'
        },
        {
          title: 'Сошиал Медиа Менежер',
          company: 'Digital Solutions',
          description: 'Сошиал медиа менежер ажилд авна. Бид таныг манай багт нэгдэхийг хүсч байна.',
          requirements: '2-3 жилийн сошиал медиа туршлага, контент бүтээх, кампанит ажил зохион байгуулах, аналитик, хэрэглэгчийн зан төлөв ойлгох чадвартай байх',
          location: 'Улаанбаатар',
          salary: '₮2,500,000 - ₮4,000,000'
        },
        {
          title: 'Маркетингийн Специалист',
          company: 'Marketing Pro',
          description: 'Маркетингийн специалист ажилд авна. Бид таныг манай багт нэгдэхийг хүсч байна.',
          requirements: '1-2 жилийн маркетингийн туршлага, сошиал медиа, цахим маркетинг мэдлэгтэй, бүтээлч сэтгэлгээ, багийн ажил, англи хэл мэдлэг (туслах)',
          location: 'Улаанбаатар',
          salary: '₮2,000,000 - ₮3,500,000'
        }
      ];

      for (const job of sampleJobs) {
        await prisma.job.create({
          data: job
        });
      }

      // Fetch the newly created jobs
      const newJobs = await prisma.job.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log('Created new jobs:', newJobs.length);
      return NextResponse.json(newJobs);
    }

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { title, company, description, requirements, location, salary } = await req.json();

    if (!title || !company || !description || !requirements || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        title,
        company,
        description,
        requirements,
        location,
        salary
      }
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
} 