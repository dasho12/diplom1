import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mammoth from 'mammoth';
import { prisma } from '@/lib/prisma';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

interface PythonResult {
  success: boolean;
  text?: string;
  error?: string;
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Create a temporary file
    const tempFile = join(tmpdir(), `pdf-${Date.now()}.pdf`);
    await writeFile(tempFile, buffer);

    // Run Python script
    const pythonProcess = spawn('python', ['scripts/pdf_parser.py']);
    
    // Send PDF data to Python script
    pythonProcess.stdin.write(buffer.toString('base64'));
    pythonProcess.stdin.end();

    // Get result from Python script
    const result = await new Promise<PythonResult>((resolve, reject) => {
      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      pythonProcess.stderr.on('data', (data) => {
        console.error('Python error:', data.toString());
      });
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(output));
          } catch (e) {
            reject(new Error('Failed to parse Python output'));
          }
        } else {
          reject(new Error(`Python process exited with code ${code}`));
        }
      });
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to parse PDF');
    }

    return result.text || '';
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw error;
  }
}

async function analyzeCV(content: string) {
  try {
    console.log('Starting CV analysis...');
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "CV Analyzer",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-v3-base:free",
        "max_tokens": 2000,
        "temperature": 0.7,
        "messages": [
          {
            role: 'system',
            content: `You are an expert CV analyzer. Analyze the following CV and provide detailed feedback in Mongolian language. First, extract and structure the following information from the CV:

1. Хувийн Мэдээлэл (Personal Information):
   - Нэр, нас, хүйс
   - Холбоо барих мэдээлэл
   - Хаяг, байршил

2. Боловсрол (Education):
   - Сургуулиуд
   - Мэргэжлүүд
   - Он сар
   - Гол хичээлүүд
   - Дүн, шагнал

3. Ажлын Туршлага (Work Experience):
   - Компаниуд
   - Албан тушаал
   - Он сар
   - Гол үүрэг, хариуцлага
   - Дараах ажлууд

4. Ур чадвар (Skills):
   - Техникийн ур чадвар
   - Хувь хөгжлийн ур чадвар
   - Хэлний мэдлэг
   - Сертификатууд

5. Төсөл, Дараах Ажлууд (Projects & Achievements):
   - Төслүүд
   - Дараах ажлууд
   - Шагнал, урамшуулал

Then, provide a detailed analysis in this format:

1. CV Шинжилгээ:
   - Хүч талууд:
     * Тодорхой бичнэ үү
     * Жишээгээр дэмжнэ үү
   - Сул талууд:
     * Тодорхой бичнэ үү
     * Жишээгээр дэмжнэ үү

2. Сайжруулах Хэсгүүд:
   - Хэсэг бүрийг тодорхойлно уу
   - Яагаад сайжруулах шаардлагатайг тайлбарлана уу
   - Жишээгээр дэмжнэ үү

3. Тодорхой Зөвлөмж:
   - Хэсэг бүрт тодорхой зөвлөмж өгнө үү
   - Хэрэгжүүлэх боломжтой байх ёстой
   - Жишээгээр дэмжнэ үү

4. Жишээ болон Хувилбарууд:
   - Хэсэг бүрт жишээ өгнө үү
   - Хувилбаруудыг тодорхойлно уу
   - Яагаад эдгээр нь сайн гэдгийг тайлбарлана уу

5. Алхам Алхмаар Зааварчилгаа:
   - Хэсэг бүрийг хэрхэн сайжруулах вэ
   - Тодорхой алхмуудыг бичнэ үү
   - Жишээгээр дэмжнэ үү

Хариултаа мэргэжлийн карьер зөвлөгчийн хувийн зөвлөмж шиг нарийвчилсан, тусламжтай байлгана уу.`
          },
          {
            role: 'user',
            content: `Дараах CV-г дээрх алхмуудыг дагаж шинжилж, дэлгэрэнгүй санал болгож өгнө үү: ${content}`
          }
        ]
      })
    });

    console.log('OpenRouter response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error('OpenRouter error:', errorData);
      
      // Check if it's a rate limit error
      if (errorData.error?.code === 429) {
        return `Уучлаарай, одоогоор системийн хязгаарлалттай байна. Дараах зүйлсийг хийж болно:

1. Хэдэн минут хүлээгээд дахин оролдоно уу
2. Энэ CV-г хадгалж авч, дараа дахин оролдоно уу
3. Чат функцээр CV-гээ дэлгэрэнгүй шинжилгээ хийх боломжтой

Одоогийн байдлаар CV-г амжилттай хадгалж авлаа. Дараа дахин оролдох үед дэлгэрэнгүй шинжилгээ хийх боломжтой.`;
      }
      
      throw new Error('Failed to analyze CV');
    }

    const data = await response.json();
    console.log('OpenRouter response data:', data);

    if (!data?.choices?.[0]?.message?.content) {
      console.error('Invalid analysis response structure:', data);
      throw new Error('Invalid analysis response');
    }

    const analysis = data.choices[0].message.content;
    console.log('Analysis completed successfully');
    return analysis;
  } catch (error) {
    console.error('CV analysis error:', error);
    return `CV-г амжилттай хадгалж авлаа. Дараах зүйлсийг хийж болно:

1. Чат функцээр CV-гээ дэлгэрэнгүй шинжилгээ хийх
2. Хэдэн минут хүлээгээд дахин оролдох
3. CV-гээ засварлаад дахин илгээх

Одоогийн байдлаар CV-г амжилттай хадгалж авлаа. Дараа дахин оролдох үед дэлгэрэнгүй шинжилгээ хийх боломжтой.`;
  }
}

export async function POST(req: Request) {
  console.log('Upload route called');
  
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user) {
      console.log('No session found');
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          } 
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    console.log('File received:', file?.name, file?.type);
    
    const userId = session.user.id;

    if (!file) {
      console.log('No file in request');
      return new NextResponse(
        JSON.stringify({ error: 'No file uploaded' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          } 
        }
      );
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return new NextResponse(
        JSON.stringify({ error: 'Unsupported file type. Please upload a PDF or Word document.' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          } 
        }
      );
    }

    console.log('Processing file...');
    const buffer = Buffer.from(await file.arrayBuffer());
    let content = '';

    try {
      if (file.type === 'application/pdf') {
        console.log('Processing PDF...');
        content = await extractTextFromPDF(buffer);
        console.log('PDF content extracted:', content.substring(0, 100) + '...');
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      ) {
        console.log('Processing Word document...');
        const result = await mammoth.extractRawText({ buffer });
        content = result.value;
        console.log('Word content extracted:', content.substring(0, 100) + '...');
      }

      if (!content || content.trim().length === 0) {
        console.log('No content extracted from file');
        return new NextResponse(
          JSON.stringify({ error: 'Could not extract any text from the file. Please try another file.' }),
          { 
            status: 400, 
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store'
            } 
          }
        );
      }

      console.log('Analyzing CV...');
      const analysis = await analyzeCV(content);
      console.log('CV analysis completed');

      console.log('Saving to database...');
      // Save CV to database
      const cv = await prisma.cV.create({
        data: {
          userId,
          fileName: file.name,
          fileType: file.type,
          content,
        },
      });
      console.log('CV saved successfully:', cv.id);

      // Return the CV data with content
      return new NextResponse(
        JSON.stringify({
          ...cv,
          content: content // Include the content in the response
        }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          } 
        }
      );
    } catch (error) {
      console.error('File processing error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to process the file. Please try again.' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          } 
        }
      );
    }
  } catch (error) {
    console.error('Upload route error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        } 
      }
    );
  }
}
