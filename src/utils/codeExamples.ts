export interface CodeExample {
  endpoint: string;
  method: 'GET' | 'POST';
  sampleParams?: string;
  sampleBody?: any;
  description?: string;
  startHereNote?: string;
}

export const codeExamples: Record<string, CodeExample> = {
  '/v1/titles/normalise': {
    endpoint: '/v1/titles/normalise',
    method: 'GET',
    sampleParams: '?titles=Senior+Dev,Sr+Software+Engineer,Software+Dev+Lead&limit=3',
    description: 'Normalise inconsistent job titles for better data quality',
    startHereNote: 'Always normalise job titles first. SA job market uses inconsistent titling. Passing normalised titles to other endpoints produces significantly better data quality.'
  },
  '/v1/salary/benchmark': {
    endpoint: '/v1/salary/benchmark',
    method: 'GET',
    sampleParams: '?title=Software+Engineer&location=Johannesburg&experience=5&currency=ZAR',
    description: 'Get salary benchmarks for specific roles and locations'
  },
  '/v1/salary/compare': {
    endpoint: '/v1/salary/compare',
    method: 'GET',
    sampleParams: '?title=Data+Scientist&locations=Johannesburg,Cape+Town,Durban&currency=ZAR',
    description: 'Compare salaries across different locations'
  },
  '/v1/skills/demand': {
    endpoint: '/v1/skills/demand',
    method: 'GET',
    sampleParams: '?skills=React,TypeScript,Node.js&location=South+Africa&period=6m',
    description: 'Analyze demand for specific skills in the market'
  },
  '/v1/skills/trending': {
    endpoint: '/v1/skills/trending',
    method: 'GET',
    sampleParams: '?location=South+Africa&category=engineering&limit=10',
    description: 'Get trending skills based on job posting analysis'
  },
  '/v1/roles/intelligence': {
    endpoint: '/v1/roles/intelligence',
    method: 'GET',
    sampleParams: '?title=Product+Manager&location=Cape+Town',
    description: 'Get detailed intelligence about specific job roles'
  },
  '/v1/company/hiring': {
    endpoint: '/v1/company/hiring',
    method: 'GET',
    sampleParams: '?company=Capitec+Bank&location=South+Africa',
    description: 'Analyze hiring patterns for specific companies'
  },
  '/v1/company/compare': {
    endpoint: '/v1/company/compare',
    method: 'GET',
    sampleParams: '?companies=FNB,Absa,Standard+Bank,Nedbank&metrics=salary,growth,openings',
    description: 'Compare company metrics such as salary, growth, and openings'
  },
  '/v1/skills/gap-analysis': {
    endpoint: '/v1/skills/gap-analysis',
    method: 'POST',
    sampleBody: {
      "current_skills": ["JavaScript", "React", "REST APIs", "Git"],
      "target_role": "Senior Full Stack Engineer",
      "location": "Johannesburg",
      "experience_years": 3
    },
    description: 'Identify skills gaps between current profile and target role'
  },
  '/v1/market/overview': {
    endpoint: '/v1/market/overview',
    method: 'GET',
    sampleParams: '?location=South+Africa&sector=fintech',
    description: 'Get market overview data for specific locations and sectors'
  },
  '/v1/salary/evaluate': {
    endpoint: '/v1/salary/evaluate',
    method: 'POST',
    sampleBody: {
      "title": "Senior Software Engineer",
      "location": "Johannesburg",
      "offered_salary": 85000,
      "currency": "ZAR",
      "experience_years": 6,
      "skills": ["React", "Node.js", "AWS", "TypeScript"]
    },
    description: 'Evaluate if an offered salary is competitive'
  },
  '/v1/jobs/search': {
    endpoint: '/v1/jobs/search',
    method: 'GET',
    sampleParams: '?title=DevOps+Engineer&location=Pretoria&remote=true',
    description: 'Search for active job postings'
  }
};
