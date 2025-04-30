import { prisma } from './prisma';
import { Job } from '@prisma/client';

interface JobMatch {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary?: string;
  };
  matchScore: number;
  matchDetails: {
    experience: number;
    skills: number;
    education: number;
    overall: number;
  };
}

export async function calculateJobMatches(cvContent: string): Promise<JobMatch[]> {
  try {
    console.log('Starting job matching process...');
    
    // Get all jobs from the database
    const jobs = await prisma.job.findMany();
    console.log('Found jobs:', jobs.length);
    
    if (jobs.length === 0) {
      console.log('No jobs found in database');
      return [];
    }
    
    // Calculate matches for each job
    const matches = await Promise.all(jobs.map(async (job: Job) => {
      try {
        console.log('Processing job:', job.title);
        const matchDetails = await calculateDetailedMatchScore(cvContent, job.requirements);
        console.log('Match details for', job.title, ':', matchDetails);
        
        return {
          job: {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary || undefined
          },
          matchScore: matchDetails.overall,
          matchDetails
        };
      } catch (error) {
        console.error('Error processing job:', job.title, error);
        return null;
      }
    }));

    // Filter out null matches and sort by score
    const validMatches = matches.filter(match => match !== null) as JobMatch[];
    console.log('Valid matches:', validMatches.length);
    
    const sortedMatches = validMatches.sort((a, b) => b.matchScore - a.matchScore);
    console.log('Sorted matches:', sortedMatches.length);
    
    return sortedMatches;
  } catch (error) {
    console.error('Error calculating job matches:', error);
    return [];
  }
}

async function calculateDetailedMatchScore(cvContent: string, jobRequirements: string) {
  try {
    console.log('Calculating match score...');
    console.log('CV Content length:', cvContent.length);
    console.log('Job Requirements:', jobRequirements);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "Job Matcher",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "mistralai/mistral-7b-instruct:free",
        "max_tokens": 500,
        "temperature": 0.3,
        "messages": [
          {
            role: 'system',
            content: `You are a job matching expert. Analyze the CV content and job requirements, then provide detailed match scores for each category and an overall score. The scores should be based on:

1. Experience Match (30% of total):
   - Years of experience (e.g., "5 жилийн туршлага" = 100% for 5 years requirement)
   - Relevant industry experience
   - Role-specific experience

2. Skills Match (40% of total):
   - Required technical skills (e.g., "сошиал медиа", "маркетинг")
   - Soft skills (e.g., "бүтээлч сэтгэлгээ", "багийн ажил")
   - Language skills
   - Certifications

3. Education Match (30% of total):
   - Required degree level
   - Field of study
   - Relevant coursework
   - Academic achievements

Return the scores in this exact format:
{
  "experience": number,
  "skills": number,
  "education": number,
  "overall": number
}

The overall score should be calculated as:
(experience * 0.3) + (skills * 0.4) + (education * 0.3)

Each score should be between 0 and 100.`
          },
          {
            role: 'user',
            content: `CV Content: ${cvContent}\n\nJob Requirements: ${jobRequirements}\n\nCalculate the detailed match scores:`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error('OpenRouter error:', errorData);
      
      // Check if it's a rate limit error
      if (errorData.error?.code === 429) {
        console.log('Rate limit exceeded, using fallback matching');
        return calculateFallbackMatchScore(cvContent, jobRequirements);
      }
      
      throw new Error('Failed to calculate match score');
    }

    const data = await response.json();
    console.log('OpenRouter response:', data);
    
    if (!data?.choices?.[0]?.message?.content) {
      console.error('Invalid response format:', data);
      return calculateFallbackMatchScore(cvContent, jobRequirements);
    }

    const scores = JSON.parse(data.choices[0].message.content);
    console.log('Parsed scores:', scores);
    
    // Ensure all scores are between 0 and 100
    return {
      experience: Math.min(Math.max(scores.experience, 0), 100),
      skills: Math.min(Math.max(scores.skills, 0), 100),
      education: Math.min(Math.max(scores.education, 0), 100),
      overall: Math.min(Math.max(scores.overall, 0), 100)
    };
  } catch (error) {
    console.error('Error calculating match score:', error);
    return calculateFallbackMatchScore(cvContent, jobRequirements);
  }
}

function calculateFallbackMatchScore(cvContent: string, jobRequirements: string) {
  try {
    console.log('Using fallback matching algorithm');
    
    const cvLower = cvContent.toLowerCase();
    const requirementsLower = jobRequirements.toLowerCase();
    
    // Experience matching (30% of total)
    let experienceScore = 0;
    const experiencePatterns = [
      /(\d+)\s*(?:жил|year|years?)\s*(?:туршлага|experience)/i,
      /(\d+)\s*(?:жил|year|years?)\s*(?:ажилласан|worked)/i
    ];
    
    // Extract years from requirements
    let requiredYears = 0;
    for (const pattern of experiencePatterns) {
      const match = requirementsLower.match(pattern);
      if (match) {
        requiredYears = parseInt(match[1]);
        break;
      }
    }
    
    // Extract years from CV
    let cvYears = 0;
    for (const pattern of experiencePatterns) {
      const match = cvLower.match(pattern);
      if (match) {
        cvYears = parseInt(match[1]);
        break;
      }
    }
    
    if (requiredYears === 0) {
      experienceScore = 100; // No experience requirement
    } else if (cvYears === 0) {
      experienceScore = 0; // No experience mentioned
    } else {
      experienceScore = Math.min((cvYears / requiredYears) * 100, 100);
    }
    
    // Skills matching (40% of total)
    const skillKeywords = [
      'сошиал медиа', 'social media',
      'маркетинг', 'marketing',
      'брэнд', 'brand',
      'судалгаа', 'research',
      'хэрэглэгч', 'customer',
      'баг', 'team',
      'удирдлага', 'management',
      'стратеги', 'strategy',
      'төсөл', 'project',
      'хэл', 'language'
    ];
    
    let skillsScore = 0;
    let matchCount = 0;
    for (const skill of skillKeywords) {
      if (requirementsLower.includes(skill) && cvLower.includes(skill)) {
        matchCount++;
      }
    }
    
    const totalSkills = skillKeywords.filter(skill => requirementsLower.includes(skill)).length;
    if (totalSkills === 0) {
      skillsScore = 100;
    } else {
      skillsScore = (matchCount / totalSkills) * 100;
    }
    
    // Education matching (30% of total)
    const educationKeywords = [
      'бакалавр', 'bachelor',
      'магистр', 'master',
      'доктор', 'phd',
      'сэзис', 'sezis',
      'их сургууль', 'university',
      'коллеж', 'college'
    ];
    
    let educationScore = 0;
    let educationMatchCount = 0;
    for (const keyword of educationKeywords) {
      if (requirementsLower.includes(keyword) && cvLower.includes(keyword)) {
        educationMatchCount++;
      }
    }
    
    const totalEducation = educationKeywords.filter(keyword => requirementsLower.includes(keyword)).length;
    if (totalEducation === 0) {
      educationScore = 100;
    } else {
      educationScore = (educationMatchCount / totalEducation) * 100;
    }
    
    // Calculate overall score
    const overallScore = (experienceScore * 0.3) + (skillsScore * 0.4) + (educationScore * 0.3);
    
    return {
      experience: Math.round(experienceScore),
      skills: Math.round(skillsScore),
      education: Math.round(educationScore),
      overall: Math.round(overallScore)
    };
  } catch (error) {
    console.error('Error in fallback matching:', error);
    return {
      experience: 0,
      skills: 0,
      education: 0,
      overall: 0
    };
  }
} 