import { PrismaClient } from '@prisma/client';
import { analyzeResume } from '../prompts/resumeAnalysis.prompt';

const prisma = new PrismaClient();

export const resumeAnalysisService = {
  async analyzeResume(resumeText: string): Promise<any> {
    try {
      const analysis = await analyzeResume(resumeText);
      
      const savedAnalysis = await prisma.resumeAnalysis.create({
        data: {
          resume_text: resumeText,
          parsed_data: analysis.parsed_data,
          matching_score: analysis.matching_score,
          matched_roles: analysis.matched_roles,
          missing_skills: analysis.missing_skills,
          recommended_skills: analysis.recommended_skills,
          experience_summary: analysis.experience_summary,
          education_summary: analysis.education_summary,
          certifications: analysis.certifications,
          skills_extracted: analysis.skills_extracted,
        },
      });

      return savedAnalysis;
    } catch (error) {
      console.error('Resume analysis error:', error);
      throw new Error('Failed to analyze resume');
    }
  },

  async getResumeAnalysis(id: string): Promise<any> {
    try {
      const analysis = await prisma.resumeAnalysis.findUnique({
        where: { id },
      });
      
      if (!analysis) {
        throw new Error('Resume analysis not found');
      }
      
      return analysis;
    } catch (error) {
      console.error('Get resume analysis error:', error);
      throw new Error('Failed to get resume analysis');
    }
  },
};
