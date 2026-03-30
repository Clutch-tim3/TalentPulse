# TalentPulse API — Real-Time Labour Market Intelligence API

The most powerful real-time labour market intelligence API available to developers globally. Provides salary benchmarks, skill demand trends, role intelligence, company hiring data, and skill gap analysis — all in one REST API.

## Features

### 🔍 **Core Intelligence**
- **Salary Benchmarks**: Get comprehensive salary data with percentiles, total compensation, and location-based cost of living adjustments
- **Skill Demand**: Real-time skill demand scores, trends, and salary premiums
- **Role Intelligence**: Deep insights into job roles including responsibilities, career paths, and market outlook
- **Company Hiring**: Detailed hiring profiles with department breakdowns, tech stack signals, and talent intelligence
- **Market Overview**: Sector-specific market analysis including hiring activity, salary trends, and macro talent signals
- **Job Search**: Live job postings with intelligent enrichment from multiple sources
- **Title Normalization**: Convert messy job titles to standard industry taxonomy
- **Skill Gap Analysis**: AI-powered analysis of career transition skill gaps with learning path recommendations

## Tech Stack

- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript 5 (strict mode)
- **Framework**: Express.js 4
- **Database**: PostgreSQL 16 via Prisma ORM
- **Cache**: Redis 7 (ioredis)
- **Queue**: BullMQ (background jobs)
- **AI**: Anthropic Claude API
- **Scraping**: Puppeteer + Cheerio
- **Validation**: Zod
- **Auth**: X-RapidAPI-Key header
- **Rate Limiting**: Redis sliding-window
- **Logging**: Winston + Morgan
- **Security**: Helmet.js, hpp, xss-clean
- **Docs**: OpenAPI 3.0 + Swagger UI
- **Testing**: Jest + supertest + nock
- **Containers**: Docker + docker-compose
- **Deployment**: Railway + Render

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker (optional, for containerized setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/talentpulse/talentpulse-api.git
   cd talentpulse-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://talentpulse:password@localhost:5432/talentpulse
   REDIS_URL=redis://localhost:6379
   ANTHROPIC_API_KEY=sk-ant-...
   BLS_API_KEY=your_bls_api_key
   ONS_API_KEY=your_ons_api_key
   EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
   ```

4. **Database setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

### Using Docker

```bash
docker-compose up --build
```

## SA Job Market Guide

South African job titles often differ from global conventions. Always use `GET /v1/titles/normalise` first for best results.

### Common SA title variations:
| What you might have    | Normalised title              |
|------------------------|-------------------------------|
| CA(SA)                 | Chartered Accountant          |
| SAICA CA               | Chartered Accountant          |
| BCom Hons Accounting   | Senior Accountant             |
| Group Financial Manager| Finance Director              |
| ICT Manager            | IT Manager                    |
| Snr Dev                | Senior Software Engineer      |
| Mine Overseer          | Mining Operations Supervisor  |
| QS                     | Quantity Surveyor             |
| BSc Civil              | Junior Civil Engineer         |
| Brand Ambassador       | Marketing Coordinator         |

### Salary data coverage by region:
| Region                | Coverage level |
|-----------------------|----------------|
| Gauteng (JHB/PTA)     | Full           |
| Western Cape (CPT)    | Full           |
| KwaZulu-Natal (DBN)   | Full           |
| Eastern Cape          | Partial        |
| Other provinces       | Limited        |
| Remote (SA-based)     | Full           |

## How Current Is the Data?

| Data Type            | Update Frequency | Source                    |
|----------------------|-----------------|---------------------------|
| Salary benchmarks    | Quarterly        | Job board aggregation + surveys |
| Skills demand        | Monthly          | Active job posting analysis |
| Trending skills      | Weekly           | Real-time job post analysis |
| Company hiring data  | Weekly           | Job board + LinkedIn data |
| Market overview      | Monthly          | Aggregated economic signals |

All responses include a `data_as_of` field:
  ```json
  "data_as_of": "2026-Q1",
  "next_update": "2026-Q2",
  "freshness_note": "Salary data is from Q1 2026. ZAR inflation adjustments applied. Salaries may have shifted ±5% since collection."
  ```

On PRO tier: salary data is updated monthly (not quarterly).
On ENTERPRISE tier: custom data freshness SLAs available.

## Skills Gap Analysis Integration Pattern

`/v1/skills/gap-analysis` powers CV builders, learning platforms, and HR upskilling tools. Here's a complete integration flow:

```javascript
// 1. Normalise the target role title
const normalised = await fetch(
  '/v1/titles/normalise?titles=' + encodeURIComponent(targetRole)
).then(r => r.json());
const cleanTitle = normalised.data.titles[0].normalised;

// 2. Get role intelligence (what skills are required)
const roleData = await fetch(
  '/v1/roles/intelligence?title=' + encodeURIComponent(cleanTitle)
).then(r => r.json());

// 3. Run gap analysis against user's current skills
const gap = await fetch('/v1/skills/gap-analysis', {
  method: 'POST',
  headers: { 'X-RapidAPI-Key': KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    current_skills: userProfile.skills,
    target_role: cleanTitle,
    location: userProfile.location,
    experience_years: userProfile.yearsExperience
  })
}).then(r => r.json());

// gap.data contains:
// - missing_skills: skills needed but not in profile
// - nice_to_have: skills that increase salary by X%
// - readiness_score: 0-100 how ready they are for the role
// - estimated_time_to_ready: months if they learn the missing skills
// - learning_resources: courses/certifications for missing skills
```

## API Endpoints

### Title Normalization (Start Here)
- `GET /v1/titles/normalise` - Normalise job titles to standard taxonomy (SA-specific examples: Senior Dev → Senior Software Engineer, QS → Quantity Surveyor)

### Salary Intelligence
- `GET /v1/salary/benchmark` - Salary benchmark for role and location
- `GET /v1/salary/compare` - Compare salaries across multiple locations
- `POST /v1/salary/evaluate` - Evaluate salary offer against market benchmarks

### Skills Intelligence
- `GET /v1/skills/demand` - Skill demand intelligence
- `GET /v1/skills/trending` - Trending skills with growth rates
- `POST /v1/skills/gap-analysis` - Skill gap analysis for career transitions

### Role Intelligence
- `GET /v1/roles/intelligence` - Deep role intelligence

### Company Intelligence
- `GET /v1/company/hiring` - Company hiring profile
- `GET /v1/company/compare` - Compare company hiring profiles

### Market Intelligence
- `GET /v1/market/overview` - Labour market overview

### Job Search
- `GET /v1/jobs/search` - Job postings search with intelligent enrichment

### Health Check
- `GET /v1/health` - API health and status

## API Documentation

Swagger UI documentation is available at:
- Local: http://localhost:3000/api-docs
- Production: https://api.talentpulse.com/api-docs

## Usage Examples

### Node.js (Axios)

```javascript
import axios from 'axios';

const apiKey = 'your_rapidapi_key';
const baseUrl = 'http://localhost:3000/v1';

const getSalaryBenchmark = async () => {
  try {
    const response = await axios.get(`${baseUrl}/salary/benchmark`, {
      params: {
        job_title: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        experience_level: 'senior',
        skills: 'React,TypeScript,Node.js',
        include_equity: true,
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
      },
    });

    console.log('Salary Benchmark:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

getSalaryBenchmark();
```

### Python (Requests)

```python
import requests

api_key = 'your_rapidapi_key'
base_url = 'http://localhost:3000/v1'

def get_salary_benchmark():
    try:
        params = {
            'job_title': 'Senior Software Engineer',
            'location': 'San Francisco, CA',
            'experience_level': 'senior',
            'skills': 'React,TypeScript,Node.js',
            'include_equity': 'true',
        }
        
        headers = {
            'X-RapidAPI-Key': api_key,
        }
        
        response = requests.get(f'{base_url}/salary/benchmark', 
                               params=params, 
                               headers=headers)
        
        print('Salary Benchmark:', response.json())
    except Exception as error:
        print('Error:', error)

get_salary_benchmark()
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": { ... },
  "meta": {
    "request_id": "req_1234567890_abc123def",
    "version": "1.0.0",
    "processing_ms": 145,
    "from_cache": true,
    "cache_age_minutes": 47,
    "data_freshness": "2025-07-14T06:00:00Z"
  }
}
```

## Rate Limiting

| Tier                | Monthly Requests | Requests/Second | Features                 |
|---------------------|-----------------|----------------|--------------------------|
| FREE                | 30              | 1              | Salary benchmark only    |
| BASIC ($39/mo)      | 500             | 3              | All endpoints            |
| PRO ($99/mo)        | 3,000           | 10             | All + higher freshness   |
| ENTERPRISE ($299/mo)| 30,000          | 50             | All + bulk + webhooks    |

## Caching Strategy

- **Salary data**: 24-hour cache
- **Skill demand trends**: 6-hour cache  
- **Company hiring data**: 12-hour cache
- **Role intelligence**: 72-hour cache

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -am 'Add some feature'`)
6. Push to the branch (`git push origin feature/your-feature`)
7. Create a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- **Documentation**: https://docs.talentpulse.com
- **Support Email**: support@talentpulse.com
- **Issue Tracker**: https://github.com/talentpulse/talentpulse-api/issues

## Roadmap

- Add more data sources (Glassdoor, Indeed)
- Implement webhooks for real-time updates
- Add batch processing capabilities
- Enhance skill gap analysis with personalized learning paths
- Add integration with popular HR/ATS platforms

## Changelog

**v1.0.0 (2025-07-14)**
- Initial release
- Core salary benchmarking
- Skill demand analysis
- Role intelligence
- Company hiring profiles
- Skill gap analysis
- Job search functionality