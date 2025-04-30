import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateJobMatches } from '@/lib/jobMatching';

interface MatchDetails {
  experience: number;
  skills: number;
  education: number;
  overall: number;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  requirements: string;
}

interface JobMatch {
  job: Job;
  matchScore: number;
  matchDetails: MatchDetails;
}

interface JobCategory {
  titles: string[];
  keywords: string[];
}

interface JobCategories {
  marketing: JobCategory;
  construction: JobCategory;
  technology: JobCategory;
  finance: JobCategory;
}

const jobCategories: JobCategories = {
  marketing: {
    titles: ['marketing manager', 'маркетингийн менежер', 'digital marketing manager', 'дижитал маркетингийн менежер'],
    keywords: ['marketing', 'маркетинг', 'digital', 'дижитал', 'brand', 'брэнд']
  },
  construction: {
    titles: ['construction marketing manager', 'барилгын маркетингийн менежер'],
    keywords: ['construction', 'барилга', 'building', 'building materials', 'барилгын материал']
  },
  technology: {
    titles: ['tech marketing manager', 'технологийн маркетингийн менежер'],
    keywords: ['technology', 'технологи', 'tech', 'software', 'программ']
  },
  finance: {
    titles: ['finance marketing manager', 'санхүүгийн маркетингийн менежер'],
    keywords: ['finance', 'санхүү', 'banking', 'банк', 'financial', 'financial services']
  }
};

export async function POST(req: Request) {
  try {
    console.log('Job matching API called');
    
    const { content } = await req.json();
    if (!content) {
      console.log('No CV content provided');
      return NextResponse.json({ error: 'CV content is required' }, { status: 400 });
    }

    console.log('CV content received, length:', content.length);
    
    // Calculate job matches with detailed information
    const matches = await calculateJobMatches(content);
    console.log('Found matches:', matches.length);

    if (matches.length === 0) {
      console.log('No matches found');
      return NextResponse.json([]);
    }

    // Filter out low matches and sort by score
    const filteredMatches = matches
      .filter(match => {
        // Get the job title and requirements in lowercase
        const jobTitle = match.job.title.toLowerCase();
        const jobRequirements = match.job.requirements.toLowerCase();
        
        // Extract the main job title from the CV content
        const cvTitle = content.toLowerCase();
        
        // Determine the CV's job category
        let cvCategory: keyof JobCategories | null = null;
        for (const [category, data] of Object.entries(jobCategories) as [keyof JobCategories, JobCategory][]) {
          if (data.titles.some((title: string) => cvTitle.includes(title)) || 
              data.keywords.some((keyword: string) => cvTitle.includes(keyword))) {
            cvCategory = category;
            break;
          }
        }
        
        // If we can't determine the CV's category, use more lenient matching
        if (!cvCategory) {
          return match.matchScore >= 50;
        }
        
        // Check if the job matches the CV's category
        const jobCategory = Object.entries(jobCategories).find(([_, data]) => 
          data.titles.some((title: string) => jobTitle.includes(title)) || 
          data.keywords.some((keyword: string) => jobTitle.includes(keyword) || jobRequirements.includes(keyword))
        )?.[0] as keyof JobCategories;
        
        // If the job's category doesn't match the CV's category, reject it
        if (jobCategory !== cvCategory) {
          return false;
        }
        
        // For matching categories, apply appropriate thresholds
        const hasGoodOverallScore = match.matchScore >= 50;
        const hasGoodSkills = match.matchDetails.skills >= 40;
        
        // Check for exact title match
        const hasExactTitleMatch = jobCategories[cvCategory].titles.some((title: string) => 
          jobTitle === title || jobTitle.includes(title)
        );
        
        if (hasExactTitleMatch) {
          return match.matchScore >= 40 && hasGoodSkills;
        }
        
        return hasGoodOverallScore && hasGoodSkills;
      })
      .sort((a, b) => {
        // First, prioritize exact title matches
        const aTitle = a.job.title.toLowerCase();
        const bTitle = b.job.title.toLowerCase();
        
        // Get the CV's category
        const cvTitle = content.toLowerCase();
        let cvCategory: keyof JobCategories | null = null;
        for (const [category, data] of Object.entries(jobCategories) as [keyof JobCategories, JobCategory][]) {
          if (data.titles.some((title: string) => cvTitle.includes(title)) || 
              data.keywords.some((keyword: string) => cvTitle.includes(keyword))) {
            cvCategory = category;
            break;
          }
        }
        
        if (cvCategory) {
          const aIsExactMatch = jobCategories[cvCategory].titles.some((title: string) => 
            aTitle === title || aTitle.includes(title)
          );
          const bIsExactMatch = jobCategories[cvCategory].titles.some((title: string) => 
            bTitle === title || bTitle.includes(title)
          );
          
          if (aIsExactMatch && !bIsExactMatch) return -1;
          if (!aIsExactMatch && bIsExactMatch) return 1;
        }
        
        // Then sort by overall score
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        
        // If scores are equal, prioritize matches with better skills
        if (b.matchDetails.skills !== a.matchDetails.skills) {
          return b.matchDetails.skills - a.matchDetails.skills;
        }
        
        // If skills are equal, prioritize matches with better experience
        return b.matchDetails.experience - a.matchDetails.experience;
      })
      .slice(0, 10); // Show top 10 matches

    console.log('Filtered matches:', filteredMatches.length);

    if (filteredMatches.length === 0) {
      console.log('No matches found with score >= 50%');
      return NextResponse.json([]);
    }

    // Add match details to response
    const response = filteredMatches.map(match => ({
      ...match,
      matchDetails: {
        experience: match.matchDetails.experience,
        skills: match.matchDetails.skills,
        education: match.matchDetails.education,
        overall: match.matchDetails.overall
      }
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error matching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to match jobs' },
      { status: 500 }
    );
  }
} 