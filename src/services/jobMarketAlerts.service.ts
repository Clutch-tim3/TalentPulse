import { PrismaClient } from '@prisma/client';
import { generateJobMarketAlerts } from '../prompts/jobMarketAlerts.prompt';

const prisma = new PrismaClient();

export const jobMarketAlertsService = {
  async createJobMarketAlert(alertData: any): Promise<any> {
    try {
      const existingAlert = await prisma.jobMarketAlert.findFirst({
        where: {
          user_email: alertData.user_email,
          alert_name: alertData.alert_name,
          is_active: true,
        },
      });

      if (existingAlert) {
        throw new Error('Alert with this name already exists for this user');
      }

      const alert = await prisma.jobMarketAlert.create({
        data: {
          alert_name: alertData.alert_name,
          search_criteria: alertData.search_criteria,
          user_email: alertData.user_email,
          alert_frequency: alertData.alert_frequency || 'daily',
          is_active: true,
        },
      });

      return alert;
    } catch (error) {
      console.error('Create job market alert error:', error);
      throw new Error('Failed to create job market alert');
    }
  },

  async getJobMarketAlerts(email: string): Promise<any> {
    try {
      const alerts = await prisma.jobMarketAlert.findMany({
        where: {
          user_email: email,
          is_active: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return alerts;
    } catch (error) {
      console.error('Get job market alerts error:', error);
      throw new Error('Failed to get job market alerts');
    }
  },

  async updateJobMarketAlert(id: string, updateData: any): Promise<any> {
    try {
      const alert = await prisma.jobMarketAlert.update({
        where: { id },
        data: updateData,
      });

      return alert;
    } catch (error) {
      console.error('Update job market alert error:', error);
      throw new Error('Failed to update job market alert');
    }
  },

  async deleteJobMarketAlert(id: string): Promise<any> {
    try {
      const alert = await prisma.jobMarketAlert.update({
        where: { id },
        data: { is_active: false },
      });

      return alert;
    } catch (error) {
      console.error('Delete job market alert error:', error);
      throw new Error('Failed to delete job market alert');
    }
  },

  async generateAlertContent(alertId: string): Promise<any> {
    try {
      const alert = await prisma.jobMarketAlert.findUnique({
        where: { id: alertId },
      });

      if (!alert) {
        throw new Error('Alert not found');
      }

      const content = await generateJobMarketAlerts(alert.search_criteria);
      
      return {
        alert,
        content,
        generated_at: new Date(),
      };
    } catch (error) {
      console.error('Generate alert content error:', error);
      throw new Error('Failed to generate alert content');
    }
  },
};
