import { PrismaClient } from '@prisma/client';
import { generateInterviewQuestions } from '../prompts/interviewPreparation.prompt';

const prisma = new PrismaClient();

export const interviewPreparationService = {
  async generateQuestions(jobTitle: string, companyName: string): Promise<any> {
    try {
      const questions = await generateInterviewQuestions(jobTitle, companyName);
      
      const savedQuestions = await prisma.interviewPreparation.create({
        data: {
          job_title: jobTitle,
          company_name: companyName,
          common_questions: questions.common_questions,
          technical_questions: questions.technical_questions,
          behavioral_questions: questions.behavioral_questions,
          company_research: questions.company_research,
          role_preparation: questions.role_preparation,
        },
      });

      return savedQuestions;
    } catch (error) {
      console.error('Interview preparation error:', error);
      throw new Error('Failed to generate interview questions');
    }
  },

  async getQuestions(jobTitle: string, companyName: string): Promise<any> {
    try {
      const questions = await prisma.interviewPreparation.findFirst({
        where: { job_title: jobTitle, company_name: companyName },
        orderBy: { last_refreshed: 'desc' },
      });
      
      if (!questions) {
        throw new Error('Interview questions not found');
      }
      
      return questions;
    } catch (error) {
      console.error('Get interview questions error:', error);
      throw new Error('Failed to get interview questions');
    }
  },
};
