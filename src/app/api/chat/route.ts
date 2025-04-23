import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user's CVs from database
    const cvs = await prisma.cV.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    const cvContent = cvs[0]?.content || 'No CV uploaded yet';

    try {
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
          "max_tokens": 500,
          "temperature": 0.7,
          "messages": [
            {
              role: 'system',
              content: `You are a friendly and helpful CV assistant. You can communicate in both English and Mongolian.
              When users write in Mongolian, respond in Mongolian. When they write in English, respond in English.

              Here is the user's CV content: ${cvContent}

              Your personality:
              - Be friendly and conversational
              - Use a warm, encouraging tone
              - Show empathy and understanding
              - Be patient and helpful
              - Use simple, clear language

              Your approach:
              1. First, understand the user's needs
              2. Then, provide personalized advice
              3. Use examples and scenarios
              4. Give step-by-step guidance
              5. Encourage and motivate

              Remember:
              - Be supportive and positive
              - Focus on solutions, not problems
              - Celebrate their achievements
              - Suggest improvements gently
              - Always end with encouragement

              Keep your responses friendly and helpful, like a trusted friend giving career advice.`
            },
            {
              role: 'user',
              content: message
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from OpenRouter');
      }

      const responseText = await response.text();
      console.log('OpenRouter response:', responseText); // Log the response for debugging
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Failed to parse OpenRouter response');
      }

      // More detailed response structure checking
      if (!data) {
        throw new Error('Empty response from OpenRouter');
      }

      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        console.error('No choices in response:', data);
        throw new Error('No choices in OpenRouter response');
      }

      if (!data.choices[0].message) {
        console.error('No message in first choice:', data.choices[0]);
        throw new Error('No message in OpenRouter response');
      }

      const content = data.choices[0].message.content;
      if (!content || typeof content !== 'string') {
        console.error('Invalid content in response:', content);
        throw new Error('Invalid content in OpenRouter response');
      }

      return NextResponse.json({
        response: content
      });
    } catch (error) {
      console.error('OpenRouter API error:', error);
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Failed to process your request. Please check your OpenRouter API key and try again.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
} 