import { PrismaClient } from '@prisma/client';
import { generateIndustryTrendReport } from '../prompts/industryTrendReports.prompt';

const prisma = new PrismaClient();

export const industryTrendReportsService = {
  async generateIndustryTrendReport(industryName: string): Promise<any> {
    try {
      const report = await generateIndustryTrendReport(industryName);
      
      const savedReport = await prisma.industryTrend.create({
        data: {
          industry_name: industryName,
          trend_summary: report.trend_summary,
          growth_rate: report.growth_rate,
          emerging_roles: report.emerging_roles,
          declining_roles: report.declining_roles,
          in_demand_skills: report.in_demand_skills,
          technology_adoption: report.technology_adoption,
          future_outlook: report.future_outlook,
        },
      });

      return savedReport;
    } catch (error) {
      console.error('Industry trend report generation error:', error);
      throw new Error('Failed to generate industry trend report');
    }
  },

  async getIndustryTrendReports(industryName?: string): Promise<any> {
    try {
      const where: any = {};
      if (industryName) where.industry_name = { contains: industryName, mode: 'insensitive' };

      const reports = await prisma.industryTrend.findMany({
        where,
        orderBy: { last_refreshed: 'desc' },
      });

      return reports;
    } catch (error) {
      console.error('Get industry trend reports error:', error);
      throw new Error('Failed to get industry trend reports');
    }
  },

  async getIndustryTrendReportByIndustry(industryName: string): Promise<any> {
    try {
      const report = await prisma.industryTrend.findFirst({
        where: { industry_name: { contains: industryName, mode: 'insensitive' } },
        orderBy: { last_refreshed: 'desc' },
      });

      if (!report) {
        throw new Error('Industry trend report not found');
      }

      return report;
    } catch (error) {
      console.error('Get industry trend report by industry error:', error);
      throw new Error('Failed to get industry trend report');
    }
  },
};
