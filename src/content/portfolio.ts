export interface PortfolioCase {
  slug: string;
  title: { ko: string; en: string };
  sector: { ko: string; en: string };
  summary: { ko: string; en: string };
  kpis: Array<{ value: string; label: { ko: string; en: string } }>;
  cover?: string; // path under /public, optional
}

// Add a new object to extend the portfolio. Order = display order.
export const portfolio: PortfolioCase[] = [
  {
    slug: "manufacturing-saas-llm-cost",
    title: {
      ko: "제조 SaaS — LLM 운영비 47% 절감",
      en: "Manufacturing SaaS — 47% LLM cost cut",
    },
    sector: { ko: "B2B SaaS", en: "B2B SaaS" },
    summary: {
      ko: "프롬프트 캐싱과 모델 라우팅으로 월 LLM 사용료를 절반 가까이 줄이고, 응답 시간은 1.8초에서 0.6초로 단축.",
      en: "Prompt caching and model routing cut monthly LLM spend nearly in half and dropped p50 latency from 1.8s to 0.6s.",
    },
    kpis: [
      { value: "47%", label: { ko: "비용 절감", en: "cost cut" } },
      { value: "0.6s", label: { ko: "p50 응답", en: "p50 latency" } },
    ],
  },
  {
    slug: "logistics-ops-automation",
    title: {
      ko: "물류 — 운영 자동화로 월 720시간 회수",
      en: "Logistics — 720 ops hours saved per month",
    },
    sector: { ko: "물류·유통", en: "Logistics" },
    summary: {
      ko: "주문, 배차, CS 알림을 하나의 워크플로우로 통합. 8주 만에 라이브, 운영팀 야근이 사라짐.",
      en: "Orders, dispatch, and CS alerts unified into a single workflow. Live in 8 weeks, ops overtime gone.",
    },
    kpis: [
      { value: "720h", label: { ko: "월 회수 시간", en: "hours saved/mo" } },
      { value: "8wk", label: { ko: "라이브까지", en: "to live" } },
    ],
  },
  {
    slug: "hr-tech-ai-screening",
    title: {
      ko: "HR Tech — AI 스크리닝으로 채용 리드타임 60% 단축",
      en: "HR Tech — 60% faster hiring lead time with AI screening",
    },
    sector: { ko: "HR / 채용", en: "HR / Recruiting" },
    summary: {
      ko: "지원서 분류, 1차 인터뷰 요약, 합격 메일까지 자동화. 리크루터는 의사결정에만 집중.",
      en: "Application triage, interview summaries, and offer letters automated end-to-end — recruiters focus on decisions.",
    },
    kpis: [
      { value: "−60%", label: { ko: "리드타임", en: "lead time" } },
      { value: "3.2×", label: { ko: "처리량", en: "throughput" } },
    ],
  },
  {
    slug: "fnb-cs-bot",
    title: {
      ko: "F&B — 24시간 CS 봇 + 매니저 알림",
      en: "F&B — 24/7 CS bot with manager alerts",
    },
    sector: { ko: "F&B", en: "F&B" },
    summary: {
      ko: "예약·문의 24시간 자동 응대, 이상 상황만 매니저 SMS로 에스컬레이션. CSAT +18pt.",
      en: "Reservations and inquiries answered 24/7; only edge cases escalate to managers via SMS. CSAT +18pt.",
    },
    kpis: [
      { value: "+18pt", label: { ko: "CSAT", en: "CSAT" } },
      { value: "92%", label: { ko: "자동 해결률", en: "auto-resolve rate" } },
    ],
  },
];
