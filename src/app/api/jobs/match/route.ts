import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateJobMatches } from '@/lib/jobMatching';

interface MatchDetails {
  experience: number;
  skills: number;
  education: number;
  overall: number;
}

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
      .filter(match => match.matchScore >= 60) // Only show matches with 60% or higher
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Show only top 5 matches

    console.log('Filtered matches:', filteredMatches.length);

    if (filteredMatches.length === 0) {
      console.log('No matches found with score >= 60%');
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

function calculateDetailedMatchScore(cvContent: string, jobRequirements: string): MatchDetails {
  try {
    const cvLower = cvContent.toLowerCase();
    const requirementsLower = jobRequirements.toLowerCase();

    // Experience matching (30% of total score)
    const experienceScore = calculateExperienceMatch(cvLower, requirementsLower);

    // Skills matching (40% of total score)
    const skillsScore = calculateSkillsMatch(cvLower, requirementsLower);

    // Education matching (30% of total score)
    const educationScore = calculateEducationMatch(cvLower, requirementsLower);

    // Calculate overall score
    const overallScore = (experienceScore * 0.3) + (skillsScore * 0.4) + (educationScore * 0.3);

    return {
      experience: Math.round(experienceScore),
      skills: Math.round(skillsScore),
      education: Math.round(educationScore),
      overall: Math.round(overallScore)
    };
  } catch (error) {
    console.error('Error calculating match score:', error);
    return {
      experience: 0,
      skills: 0,
      education: 0,
      overall: 0
    };
  }
}

function calculateExperienceMatch(cvContent: string, requirements: string): number {
  const experiencePatterns = [
    /(\d+)\s*(?:жил|year|years?)\s*(?:туршлага|experience)/i,
    /(\d+)\s*(?:жил|year|years?)\s*(?:ажилласан|worked)/i
  ];

  // Extract years from requirements
  let requiredYears = 0;
  for (const pattern of experiencePatterns) {
    const match = requirements.match(pattern);
    if (match) {
      requiredYears = parseInt(match[1]);
      break;
    }
  }

  // Extract years from CV
  let cvYears = 0;
  for (const pattern of experiencePatterns) {
    const match = cvContent.match(pattern);
    if (match) {
      cvYears = parseInt(match[1]);
      break;
    }
  }

  if (requiredYears === 0) return 100; // No experience requirement
  if (cvYears === 0) return 0; // No experience mentioned

  // Calculate match percentage
  const matchPercentage = (cvYears / requiredYears) * 100;
  return Math.min(matchPercentage, 100);
}

function calculateSkillsMatch(cvContent: string, requirements: string): number {
  // Common skills to look for
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

  // Count matching skills
  let matchCount = 0;
  for (const skill of skillKeywords) {
    if (requirements.toLowerCase().includes(skill) && cvContent.toLowerCase().includes(skill)) {
      matchCount++;
    }
  }

  // Calculate percentage
  const totalSkills = skillKeywords.filter(skill => requirements.toLowerCase().includes(skill)).length;
  if (totalSkills === 0) return 100;
  return (matchCount / totalSkills) * 100;
}

function calculateEducationMatch(cvContent: string, requirements: string): number {
  const educationKeywords = [
    'бакалавр', 'bachelor',
    'магистр', 'master',
    'доктор', 'phd',
    'сэзис', 'sezis',
    'их сургууль', 'university',
    'коллеж', 'college'
  ];

  // Count matching education requirements
  let matchCount = 0;
  for (const keyword of educationKeywords) {
    if (requirements.toLowerCase().includes(keyword) && cvContent.toLowerCase().includes(keyword)) {
      matchCount++;
    }
  }

  // Calculate percentage
  const totalEducation = educationKeywords.filter(keyword => requirements.toLowerCase().includes(keyword)).length;
  if (totalEducation === 0) return 100;
  return (matchCount / totalEducation) * 100;
} 