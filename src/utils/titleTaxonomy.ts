const jobTitleMap: Record<string, string> = {
  'fe dev': 'Frontend Developer',
  'frontend dev': 'Frontend Developer',
  'frontend engineer': 'Frontend Developer',
  'react dev': 'React Developer',
  'react engineer': 'React Developer',
  'js dev': 'JavaScript Developer',
  'javascript dev': 'JavaScript Developer',
  'full stack dev': 'Full Stack Developer',
  'full stack engineer': 'Full Stack Developer',
  'backend dev': 'Backend Developer',
  'backend engineer': 'Backend Developer',
  'node dev': 'Node.js Developer',
  'node.js dev': 'Node.js Developer',
  'python dev': 'Python Developer',
  'java dev': 'Java Developer',
  'java engineer': 'Java Developer',
  'c# dev': 'C# Developer',
  'dotnet dev': '.NET Developer',
  'golang dev': 'Go Developer',
  'go dev': 'Go Developer',
  'rust dev': 'Rust Developer',
  'devops': 'DevOps Engineer',
  'devops engineer': 'DevOps Engineer',
  'sysadmin': 'System Administrator',
  'system administrator': 'System Administrator',
  'sre': 'Site Reliability Engineer',
  'site reliability engineer': 'Site Reliability Engineer',
  'cloud engineer': 'Cloud Engineer',
  'aws engineer': 'AWS Cloud Engineer',
  'gcp engineer': 'GCP Cloud Engineer',
  'azure engineer': 'Azure Cloud Engineer',
  'data engineer': 'Data Engineer',
  'data scientist': 'Data Scientist',
  'ml engineer': 'Machine Learning Engineer',
  'machine learning engineer': 'Machine Learning Engineer',
  'ai engineer': 'AI Engineer',
  'product manager': 'Product Manager',
  'pm': 'Product Manager',
  'project manager': 'Project Manager',
  'scrum master': 'Scrum Master',
  'product owner': 'Product Owner',
  'ux designer': 'UX Designer',
  'ui designer': 'UI Designer',
  'ux/ui designer': 'UX/UI Designer',
  'designer': 'UX/UI Designer',
  'marketing manager': 'Marketing Manager',
  'digital marketer': 'Digital Marketer',
  'content marketer': 'Content Marketer',
  'growth hacker': 'Growth Marketer',
  'growth marketer': 'Growth Marketer',
  'sales manager': 'Sales Manager',
  'account executive': 'Account Executive',
  'sales representative': 'Sales Representative',
  'customer success': 'Customer Success Manager',
  'cs manager': 'Customer Success Manager',
  'support engineer': 'Support Engineer',
  'customer support': 'Customer Support Representative',
  'hr manager': 'HR Manager',
  'human resources': 'HR Manager',
  'recruiter': 'Recruiter',
  'talent acquisition': 'Talent Acquisition Specialist',
  'finance manager': 'Finance Manager',
  'accountant': 'Accountant',
  'controller': 'Controller',
  'operations manager': 'Operations Manager',
  'ops manager': 'Operations Manager',
  'business analyst': 'Business Analyst',
  'ba': 'Business Analyst',
  'software engineer': 'Software Engineer',
  'software developer': 'Software Developer',
  'engineer': 'Software Engineer',
  'developer': 'Software Developer',
};

const seniorityMap: Record<string, string> = {
  'jr': 'entry',
  'junior': 'entry',
  'entry': 'entry',
  'mid': 'mid',
  'intermediate': 'mid',
  'senior': 'senior',
  'sr': 'senior',
  'lead': 'lead',
  'principal': 'principal',
  'staff': 'principal',
  'architect': 'principal',
  'director': 'executive',
  'vp': 'executive',
  'executive': 'executive',
  'c-level': 'executive',
  'cxo': 'executive',
};

export const normalizeJobTitle = (title: string): { normalized: string; confidence: string; level: string } => {
  const normalizedTitle = title.toLowerCase().trim();
  
  for (const [pattern, normalized] of Object.entries(jobTitleMap)) {
    if (normalizedTitle.includes(pattern)) {
      let level = 'unknown';
      for (const [seniorityPattern, levelValue] of Object.entries(seniorityMap)) {
        if (normalizedTitle.includes(seniorityPattern)) {
          level = levelValue;
          break;
        }
      }
      
      if (normalizedTitle.includes('ii') || normalizedTitle.includes('level 2')) {
        level = 'senior';
      }
      
      return {
        normalized,
        confidence: 'high',
        level,
      };
    }
  }
  
  if (normalizedTitle.includes('rockstar') || normalizedTitle.includes('ninja') || normalizedTitle.includes('guru')) {
    return {
      normalized: 'Software Engineer',
      confidence: 'medium',
      level: 'unknown',
    };
  }
  
  return {
    normalized: title,
    confidence: 'low',
    level: 'unknown',
  };
};