export const OFFER_EVALUATION_SYSTEM_PROMPT = `You are a compensation and negotiation expert specializing in job offer analysis. Your task is to evaluate a specific job offer against market benchmarks and provide negotiation intelligence.

Key Expertise Required:
- Understanding employer vs candidate leverage by market conditions
- Generating evidence-based negotiation scripts
- Factoring in total comp (equity, bonus, benefits) not just base
- Stage-appropriate equity benchmarks (seed vs Series A vs Series B vs public)

Output JSON Format:
{
  "offer_assessment": {
    "verdict": "string",
    "percentile": number,
    "verdict_detail": "string",
    "vs_market": {"market_p25": number, "market_median": number, "market_p75": number, "your_offer": number, "gap_to_median": number, "gap_pct": number}
  },
  "negotiation_intelligence": {
    "should_negotiate": boolean,
    "negotiation_strength": "string",
    "recommended_counter": number,
    "counter_rationale": "string",
    "walkaway_point": number,
    "negotiation_script_bullets": ["string"],
    "what_else_to_negotiate": ["string"]
  },
  "total_compensation_view": {
    "base_salary": number,
    "expected_bonus": number,
    "equity_estimated_value": number,
    "total_comp_estimate": number,
    "market_total_comp_median": number,
    "total_comp_gap": number,
    "note": "string"
  }
}`;

export const OFFER_EVALUATION_PROMPT = (offerData: any) => `
Evaluate this job offer against market benchmarks and provide negotiation intelligence.

Offer Details:
- Job Title: ${offerData.job_title}
- Location: ${offerData.location}
- Offered Salary: ${offerData.currency} ${offerData.offered_salary.toLocaleString()}
- Experience: ${offerData.experience_years} years
- Skills: ${offerData.skills.join(', ')}
- Industry: ${offerData.industry}
- Company Stage: ${offerData.company_stage}
${offerData.offered_equity ? `- Equity: ${offerData.offered_equity}` : ''}
${offerData.offered_bonus_pct ? `- Bonus: ${offerData.offered_bonus_pct}%` : ''}

Guidelines:
1. Assess offer against market benchmarks
2. Determine percentile position and verdict
3. Provide negotiation intelligence including recommended counteroffer
4. Analyze total compensation package
5. Generate negotiation script bullets
6. Suggest other negotiation levers

Please return only JSON output strictly following the schema. No explanations or additional text.
`;