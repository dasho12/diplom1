import { prisma } from './prisma';
import { Job } from '@prisma/client';

interface JobMatch {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary?: string;
    requirements: string;
  };
  matchScore: number;
  matchDetails: {
    experience: number;
    skills: number;
    education: number;
    overall: number;
  };
}

interface SkillWithAlternatives {
  skill: string;
  weight: number;
  alternatives: string[];
}

interface SkillWithoutAlternatives {
  skill: string;
  weight: number;
}

type Skill = SkillWithAlternatives | SkillWithoutAlternatives;

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
            salary: job.salary || undefined,
            requirements: job.requirements
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
            content: `You are a job matching expert specializing in marketing roles. Analyze the CV content and job requirements, then provide detailed match scores for each category and an overall score. The scores should be based on:

1. Experience Match (35% of total):
   - Years of experience (e.g., "5 жилийн туршлага" = 100% for 5 years requirement)
   - Marketing-specific experience (digital, brand, social media, etc.)
   - Industry experience
   - Management experience
   - Project leadership experience

2. Skills Match (45% of total):
   - Core Marketing Skills (20%):
     * Digital Marketing (SEO, SEM, Social Media)
     * Content Marketing
     * Brand Management
     * Market Research
     * Marketing Strategy
   
   - Technical Skills (10%):
     * Analytics Tools (Google Analytics, etc.)
     * Marketing Automation
     * CRM Systems
     * Design Tools
     * Data Analysis
   
   - Management Skills (15%):
     * Team Leadership
     * Project Management
     * Budget Management
     * Strategic Planning
     * Stakeholder Management

3. Education Match (20% of total):
   - Marketing/Business degree
   - Relevant certifications
   - Professional development
   - Industry training

Return the scores in this exact format:
{
  "experience": number,
  "skills": number,
  "education": number,
  "overall": number
}

The overall score should be calculated as:
(experience * 0.35) + (skills * 0.45) + (education * 0.20)

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
    console.log('Using enhanced fallback matching algorithm');
    
    const cvLower = cvContent.toLowerCase();
    const requirementsLower = jobRequirements.toLowerCase();
    
    // Check if this is a marketing role
    const isMarketingRole = requirementsLower.includes('marketing') || 
                           requirementsLower.includes('маркетинг') ||
                           requirementsLower.includes('brand') ||
                           requirementsLower.includes('брэнд') ||
                           requirementsLower.includes('digital') ||
                           requirementsLower.includes('дижитал') ||
                           requirementsLower.includes('social media') ||
                           requirementsLower.includes('сошиал медиа');
    
    // Check for specific job titles and industries
    const specificJobTitles = [
      { title: 'marketing manager', weight: 2.0, alternatives: ['маркетингийн менежер'] },
      { title: 'маркетингийн менежер', weight: 2.0, alternatives: ['marketing manager'] },
      { title: 'construction marketing manager', weight: 2.0, alternatives: ['барилгын маркетингийн менежер'] },
      { title: 'барилгын маркетингийн менежер', weight: 2.0, alternatives: ['construction marketing manager'] },
      { title: 'digital marketing manager', weight: 1.8, alternatives: ['дижитал маркетингийн менежер'] },
      { title: 'дижитал маркетингийн менежер', weight: 1.8, alternatives: ['digital marketing manager'] },
      { title: 'brand manager', weight: 1.8, alternatives: ['брэнд менежер'] },
      { title: 'брэнд менежер', weight: 1.8, alternatives: ['brand manager'] }
    ];
    
    // Check for industry-specific keywords
    const industryKeywords = [
      { industry: 'construction', weight: 1.5, alternatives: ['барилга', 'building'] },
      { industry: 'барилга', weight: 1.5, alternatives: ['construction', 'building'] },
      { industry: 'technology', weight: 1.5, alternatives: ['технологи', 'tech'] },
      { industry: 'технологи', weight: 1.5, alternatives: ['technology', 'tech'] },
      { industry: 'finance', weight: 1.5, alternatives: ['санхүү', 'banking'] },
      { industry: 'санхүү', weight: 1.5, alternatives: ['finance', 'banking'] }
    ];
    
    // Calculate title match score
    let titleMatchScore = 0;
    let maxTitleWeight = 0;
    
    for (const { title, weight, alternatives } of specificJobTitles) {
      if (requirementsLower.includes(title)) {
        maxTitleWeight = Math.max(maxTitleWeight, weight);
        if (cvLower.includes(title) || alternatives.some(alt => cvLower.includes(alt))) {
          titleMatchScore += weight;
        }
      }
    }
    
    // Calculate industry match score
    let industryMatchScore = 0;
    let maxIndustryWeight = 0;
    
    for (const { industry, weight, alternatives } of industryKeywords) {
      if (requirementsLower.includes(industry)) {
        maxIndustryWeight = Math.max(maxIndustryWeight, weight);
        if (cvLower.includes(industry) || alternatives.some(alt => cvLower.includes(alt))) {
          industryMatchScore += weight;
        }
      }
    }
    
    // Normalize title and industry scores
    const normalizedTitleScore = maxTitleWeight > 0 ? (titleMatchScore / maxTitleWeight) * 100 : 0;
    const normalizedIndustryScore = maxIndustryWeight > 0 ? (industryMatchScore / maxIndustryWeight) * 100 : 0;
    
    // Experience matching (35% of total)
    let experienceScore = 0;
    const experiencePatterns = [
      /(\d+)\s*(?:жил|year|years?)\s*(?:туршлага|experience)/i,
      /(\d+)\s*(?:жил|year|years?)\s*(?:ажилласан|worked)/i,
      /(\d+)\s*(?:жил|year|years?)\s*(?:маркетинг|marketing)/i
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
    
    // Calculate marketing experience score
    let marketingExperienceScore = 0;
    const marketingExperienceKeywords = [
      { keyword: 'marketing manager', weight: 2.0 },
      { keyword: 'маркетингийн менежер', weight: 2.0 },
      { keyword: 'brand manager', weight: 1.8 },
      { keyword: 'брэнд менежер', weight: 1.8 },
      { keyword: 'digital marketing', weight: 1.5 },
      { keyword: 'дижитал маркетинг', weight: 1.5 },
      { keyword: 'social media', weight: 1.5 },
      { keyword: 'сошиал медиа', weight: 1.5 },
      { keyword: 'content marketing', weight: 1.3 },
      { keyword: 'контент маркетинг', weight: 1.3 },
      { keyword: 'market research', weight: 1.3 },
      { keyword: 'зах зээлийн судалгаа', weight: 1.3 },
      { keyword: 'brand management', weight: 1.3 },
      { keyword: 'брэнд удирдлага', weight: 1.3 },
      { keyword: 'marketing strategy', weight: 1.3 },
      { keyword: 'маркетингийн стратеги', weight: 1.3 }
    ];
    
    for (const { keyword, weight } of marketingExperienceKeywords) {
      // Check for partial matches
      if (cvLower.includes(keyword) || 
          (keyword.includes('marketing') && cvLower.includes('маркетинг')) ||
          (keyword.includes('маркетинг') && cvLower.includes('marketing'))) {
        marketingExperienceScore += weight;
      }
    }
    
    // Normalize marketing experience score (max 30 points)
    marketingExperienceScore = Math.min(marketingExperienceScore * 10, 30);
    
    if (requiredYears === 0) {
      experienceScore = 100; // No experience requirement
    } else if (cvYears === 0) {
      // If no years mentioned but has relevant experience, give partial credit
      if (marketingExperienceScore > 0) {
        experienceScore = Math.min(marketingExperienceScore * 2, 50);
      } else {
        experienceScore = 0;
      }
    } else {
      // Base experience score (70 points max)
      let baseScore = Math.min((cvYears / requiredYears) * 70, 70);
      
      // Add marketing experience bonus (30 points max)
      if (isMarketingRole) {
        experienceScore = Math.min(baseScore + marketingExperienceScore, 100);
      } else {
        experienceScore = baseScore;
      }
    }
    
    // Skills matching (45% of total)
    const skillCategories: Record<string, Skill[]> = {
      coreMarketing: [
        { skill: 'digital marketing', weight: 2.0, alternatives: ['дижитал маркетинг', 'digital', 'дижитал'] },
        { skill: 'дижитал маркетинг', weight: 2.0, alternatives: ['digital marketing', 'digital', 'дижитал'] },
        { skill: 'social media', weight: 1.8, alternatives: ['сошиал медиа', 'social', 'сошиал'] },
        { skill: 'сошиал медиа', weight: 1.8, alternatives: ['social media', 'social', 'сошиал'] },
        { skill: 'content marketing', weight: 1.8, alternatives: ['контент маркетинг', 'content', 'контент'] },
        { skill: 'контент маркетинг', weight: 1.8, alternatives: ['content marketing', 'content', 'контент'] },
        { skill: 'brand management', weight: 1.8, alternatives: ['брэнд удирдлага', 'brand', 'брэнд'] },
        { skill: 'брэнд удирдлага', weight: 1.8, alternatives: ['brand management', 'brand', 'брэнд'] },
        { skill: 'market research', weight: 1.5, alternatives: ['зах зээлийн судалгаа', 'research', 'судалгаа'] },
        { skill: 'зах зээлийн судалгаа', weight: 1.5, alternatives: ['market research', 'research', 'судалгаа'] },
        { skill: 'marketing strategy', weight: 1.5, alternatives: ['маркетингийн стратеги', 'strategy', 'стратеги'] },
        { skill: 'маркетингийн стратеги', weight: 1.5, alternatives: ['marketing strategy', 'strategy', 'стратеги'] },
        { skill: 'seo', weight: 1.3, alternatives: ['search engine optimization'] },
        { skill: 'sem', weight: 1.3, alternatives: ['search engine marketing'] },
        { skill: 'ppc', weight: 1.3, alternatives: ['pay per click', 'cost per click'] },
        { skill: 'email marketing', weight: 1.3, alternatives: ['email маркетинг', 'email', 'имэйл'] },
        { skill: 'email маркетинг', weight: 1.3, alternatives: ['email marketing', 'email', 'имэйл'] }
      ],
      technical: [
        { skill: 'google analytics', weight: 1.5 },
        { skill: 'analytics', weight: 1.3 },
        { skill: 'marketing automation', weight: 1.5 },
        { skill: 'автоматжуулалт', weight: 1.5 },
        { skill: 'crm', weight: 1.3 },
        { skill: 'customer relationship', weight: 1.3 },
        { skill: 'data analysis', weight: 1.3 },
        { skill: 'data analytics', weight: 1.3 },
        { skill: 'adobe', weight: 1.0 },
        { skill: 'photoshop', weight: 1.0 },
        { skill: 'illustrator', weight: 1.0 },
        { skill: 'excel', weight: 1.0 },
        { skill: 'powerpoint', weight: 1.0 },
        { skill: 'presentation', weight: 1.0 }
      ],
      management: [
        { skill: 'team leadership', weight: 1.5 },
        { skill: 'багийн удирдлага', weight: 1.5 },
        { skill: 'project management', weight: 1.5 },
        { skill: 'төслийн удирдлага', weight: 1.5 },
        { skill: 'budget management', weight: 1.3 },
        { skill: 'бюджет удирдлага', weight: 1.3 },
        { skill: 'strategic planning', weight: 1.3 },
        { skill: 'стратеги төлөвлөлт', weight: 1.3 },
        { skill: 'stakeholder management', weight: 1.3 },
        { skill: 'оролцогч талуудын удирдлага', weight: 1.3 },
        { skill: 'team building', weight: 1.0 },
        { skill: 'баг бүрдүүлэлт', weight: 1.0 },
        { skill: 'performance management', weight: 1.0 },
        { skill: 'гүйцэтгэлийн удирдлага', weight: 1.0 }
      ]
    };
    
    let skillsScore = 0;
    let coreMarketingScore = 0;
    let technicalScore = 0;
    let managementScore = 0;
    
    // Calculate scores for each category
    for (const category in skillCategories) {
      let categoryScore = 0;
      const skills = skillCategories[category as keyof typeof skillCategories];
      let totalWeight = 0;
      
      for (const skill of skills) {
        if (requirementsLower.includes(skill.skill)) {
          totalWeight += skill.weight;
          // Check for exact match or alternative matches
          if (cvLower.includes(skill.skill) || 
              ('alternatives' in skill && skill.alternatives.some((alt: string) => cvLower.includes(alt)))) {
            categoryScore += skill.weight;
          }
        }
      }
      
      if (totalWeight > 0) {
        const normalizedScore = (categoryScore / totalWeight) * 100;
        
        switch (category) {
          case 'coreMarketing':
            coreMarketingScore = normalizedScore;
            break;
          case 'technical':
            technicalScore = normalizedScore;
            break;
          case 'management':
            managementScore = normalizedScore;
            break;
        }
      }
    }
    
    // Calculate weighted skills score with more emphasis on core marketing for marketing roles
    if (isMarketingRole) {
      skillsScore = (coreMarketingScore * 0.6) + (technicalScore * 0.25) + (managementScore * 0.15);
    } else {
      skillsScore = (coreMarketingScore * 0.4) + (technicalScore * 0.3) + (managementScore * 0.3);
    }
    
    // Education matching (20% of total)
    const educationKeywords = [
      { keyword: 'бакалавр', weight: 1.0 },
      { keyword: 'bachelor', weight: 1.0 },
      { keyword: 'магистр', weight: 1.5 },
      { keyword: 'master', weight: 1.5 },
      { keyword: 'доктор', weight: 2.0 },
      { keyword: 'phd', weight: 2.0 },
      { keyword: 'сэзис', weight: 1.0 },
      { keyword: 'sezis', weight: 1.0 },
      { keyword: 'их сургууль', weight: 1.0 },
      { keyword: 'university', weight: 1.0 },
      { keyword: 'коллеж', weight: 0.8 },
      { keyword: 'college', weight: 0.8 },
      { keyword: 'marketing', weight: 1.5 },
      { keyword: 'маркетинг', weight: 1.5 },
      { keyword: 'business', weight: 1.3 },
      { keyword: 'бизнес', weight: 1.3 },
      { keyword: 'management', weight: 1.3 },
      { keyword: 'удирдлага', weight: 1.3 },
      { keyword: 'economics', weight: 1.0 },
      { keyword: 'эдийн засаг', weight: 1.0 }
    ];
    
    let educationScore = 0;
    let educationMatchScore = 0;
    let totalEducationWeight = 0;
    
    for (const { keyword, weight } of educationKeywords) {
      if (requirementsLower.includes(keyword)) {
        totalEducationWeight += weight;
        if (cvLower.includes(keyword)) {
          educationMatchScore += weight;
        }
      }
    }
    
    if (totalEducationWeight === 0) {
      educationScore = 100;
    } else {
      educationScore = (educationMatchScore / totalEducationWeight) * 100;
    }
    
    // Calculate overall score with title and industry consideration
    const overallScore = (experienceScore * 0.35) + 
                        (skillsScore * 0.35) + 
                        (educationScore * 0.15) +
                        (normalizedTitleScore * 0.10) +
                        (normalizedIndustryScore * 0.05);
    
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