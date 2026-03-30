import prisma from '../config/database';
import redis from '../config/redis';
import aiService from './ai.service';
import { SkillGapAnalysisRequest, SkillGapAnalysisResponse } from '../types/skills.types';
import { hashObject } from '../utils/hashUtils';

class GapAnalysisService {
  private async getCacheKey(request: SkillGapAnalysisRequest): Promise<string> {
    return `gapanalysis:${hashObject(request)}`;
  }

  async analyzeSkillGap(request: SkillGapAnalysisRequest): Promise<SkillGapAnalysisResponse> {
    const cacheKey = await this.getCacheKey(request);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await aiService.analyzeSkillGap(
      request.current_skills,
      request.target_role,
      request.current_role,
      request.experience_years,
      request.target_timeline_months
    );

    await prisma.skillGapAnalysis.create({
      data: {
        input_hash: hashObject(request),
        current_skills: request.current_skills,
        target_role: request.target_role,
        target_location: request.target_location,
        result: result,
      },
    });

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 30 * 24 * 60 * 60);
    
    return result;
  }

  async getExistingAnalysis(request: SkillGapAnalysisRequest): Promise<SkillGapAnalysisResponse | null> {
    const analysis = await prisma.skillGapAnalysis.findUnique({
      where: {
        input_hash: hashObject(request),
      },
    });

    return analysis?.result as SkillGapAnalysisResponse | null;
  }
}

export default new GapAnalysisService();