import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create sample jobs
    const jobs = [
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

    for (const job of jobs) {
      await prisma.job.create({
        data: job
      });
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 