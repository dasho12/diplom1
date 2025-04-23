import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  console.log('Upload route called');
  
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    console.log('File received:', file?.name, file?.type);
    
    const userId = session.user.id;

    if (!file) {
      console.log('No file in request');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json({ 
        error: 'Unsupported file type. Please upload a PDF or Word document.' 
      }, { status: 400 });
    }

    console.log('Processing file...');
    const buffer = Buffer.from(await file.arrayBuffer());
    let content = '';

    try {
      if (file.type === 'application/pdf') {
        console.log('Processing PDF...');
        try {
          const data = await pdfParse(buffer);
          content = data.text;
          console.log('PDF processed successfully');
        } catch (error) {
          console.error('PDF parsing error:', error);
          return NextResponse.json({ 
            error: 'Failed to parse PDF file. Please make sure it is a valid PDF file.' 
          }, { status: 400 });
        }
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      ) {
        console.log('Processing Word document...');
        try {
          const result = await mammoth.extractRawText({ buffer });
          content = result.value;
          console.log('Word document processed successfully');
        } catch (error) {
          console.error('Word parsing error:', error);
          return NextResponse.json({ 
            error: 'Failed to parse Word document. Please make sure it is a valid Word file.' 
          }, { status: 400 });
        }
      }

      if (!content || content.trim().length === 0) {
        console.log('No content extracted from file');
        return NextResponse.json({ 
          error: 'Could not extract any text from the file. Please try another file.' 
        }, { status: 400 });
      }

      console.log('Saving to database...');
      // Save CV to database with basic analysis
      const cv = await prisma.cV.create({
        data: {
          userId,
          fileName: file.name,
          fileType: file.type,
          content,
          analysis: `Basic CV Analysis:
1. File successfully uploaded and processed
2. Content extracted successfully
3. Ready for detailed analysis
4. You can now chat with the CV assistant for detailed feedback`
        },
      });
      console.log('CV saved successfully:', cv.id);

      return NextResponse.json(cv);
    } catch (error) {
      console.error('File processing error:', error);
      return NextResponse.json({
        error: 'Failed to process the file. Please try again.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json({
      error: 'An unexpected error occurred. Please try again.'
    }, { status: 500 });
  }
}
