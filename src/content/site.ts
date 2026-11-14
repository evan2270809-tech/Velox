/**
 * 사이트 설정 — 아직 확정되지 않은 값은 전부 이 파일에 모았다.
 * 값 하나만 고치면 화면 전체(히어로·문의·푸터·내비·검색/공유 정보)에 반영된다.
 * 문안(글)은 messages/en.json, messages/ko.json 에 있다.
 */

export const site = {
  /** 회사 표기. 법인 형태 표기는 붙이지 않는다. */
  name: "Velox",

  /** 공개 문의 메일(임시). 모든 버튼과 푸터가 이 주소 하나로 메일을 보낸다. */
  contactEmail: "veloxai.official@gmail.com",

  /**
   * 사이트 주소(도메인). 정해지면 "https://example.com" 형태로 적는다.
   * null 이면 배포 환경(Vercel)의 주소를 자동으로 쓴다. 공유 이미지·canonical 주소에 쓰인다.
   */
  url: null as string | null,

  /** 언어. 기본 언어는 주소에 접두어가 없고(/), 나머지는 /ko 처럼 붙는다. */
  locales: ["en", "ko"] as const,
  defaultLocale: "en" as const,

  /**
   * false: "/" 는 누구에게나 기본 언어(영어)로 열린다.
   * true : 방문자 브라우저 언어가 한국어면 "/" 에서 "/ko" 로 자동 이동한다.
   */
  detectBrowserLanguage: false,

  /** 푸터의 "Founded by HKUST students" 한 줄. 빼려면 false. */
  showFoundedLine: true,

  /** "지금 단계"의 날짜 표시. 날짜를 숨기려면 false. */
  showTimelineDates: true,
} as const;

export type Locale = (typeof site.locales)[number];

/** 언어 전환 버튼의 접근성 이름 */
export const localeNames: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
};

/** 공유(Open Graph) 정보의 언어 코드 */
export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  ko: "ko_KR",
};

/* -------------------------------------------------------------------------- */
/* 이미지 자리                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * 이미지는 경로만 바꾸면 교체된다.
 *
 * - "/images/concept/" 아래 파일은 컨셉 그림으로 취급한다.
 *   → 화면에 "Concept illustration" 라벨이 자동으로 붙고, 틀에 꽉 차게 잘라서 보여 준다.
 * - 그 밖의 경로(예: "/images/real/")는 실제 화면·사진으로 취급한다.
 *   → 라벨이 붙지 않고, 잘리지 않도록 전체가 보이게 넣는다.
 *
 * 실제 자료는 공개 승인이 난 뒤에만 public/images/real/ 에 넣는다.
 */
const CONCEPT_DIR = "/images/concept/";

export function isConceptImage(src: string): boolean {
  return src.startsWith(CONCEPT_DIR);
}

export type BuildStatus = "working" | "development" | "concept";

/** 카드 영상. 무음 MP4 + 포스터. width/height 는 영상 비율(잘리지 않게 이 비율로 보여 준다). */
export type BuildingVideo = {
  src: string;
  poster: string;
  width: number;
  height: number;
};

/** 이미지 파일과 원본 크기. 틀이 이 비율을 따르므로 그림이 잘리지 않는다. */
export type MediaImage = { src: string; width: number; height: number };

/**
 * 첫 화면 영상: 실제 기록 재생 화면(Prototype 1 Collector Review).
 * 재생 버튼·컨트롤 없이, 화면에 보이는 동안 소리 없이 반복 재생된다.
 */
export const heroVideo: BuildingVideo = {
  src: "/videos/collector-review.mp4",
  poster: "/images/real/collector-review-poster.webp",
  width: 1920,
  height: 900,
};

/**
 * "우리가 만드는 것" 카드 6장. 순서·상태·이미지를 여기서 정한다.
 * 배치: 1·2번 반반, 3번 한 줄 전체, 4~6번 세 칸.
 * 수집 소프트웨어 카드는 그림 대신 실제 기록의 측정값(readout)을 보여 준다
 * (재생 영상은 첫 화면에 있다).
 * id 는 messages 의 building.items.<id> 문안과 짝을 이룬다.
 */
export const buildingItems = [
  {
    id: "collectionSoftware",
    status: "development",
    readout: true,
  },
  {
    id: "glovePrototype",
    status: "working",
    // 승인 후 실제 자료로 교체할 자리
    image: { src: "/images/concept/bg-01-glove-closeup.webp", width: 1040, height: 585 },
  },
  {
    id: "captureSystem",
    status: "development",
    image: { src: "/images/concept/hardware-lineup-five-fingers.webp", width: 1667, height: 834 },
  },
  {
    id: "wholeHandGlove",
    status: "concept",
    // 승인 후 실제 자료로 교체할 자리
    image: { src: "/images/concept/bg-07-open-hand.webp", width: 1100, height: 687 },
  },
  {
    id: "fingertipShearSensor",
    status: "concept",
    // 승인 후 실제 자료로 교체할 자리
    image: { src: "/images/concept/bg-05-fingertip-tactile-grid.webp", width: 1020, height: 637 },
  },
  {
    id: "dataFormat",
    status: "development",
    image: { src: "/images/concept/bg-04-signal-pane.webp", width: 1220, height: 762 },
  },
] as const satisfies ReadonlyArray<{
  id: string;
  status: BuildStatus;
  image?: MediaImage;
  readout?: boolean;
}>;

export type BuildingItemId = (typeof buildingItems)[number]["id"];


/** 공유 이미지 (1200×630) */
export const shareImages: Record<Locale, string> = {
  en: "/og/velox-og-en.jpg",
  ko: "/og/velox-og-ko.jpg",
};

/**
 * 로고. 사이트용으로 새로 그린 워드마크(둥근 모서리의 기하학적 글자).
 * 기존 공식 워드마크로 되돌리려면 src 를 "/brand/velox-logo-black.svg", 크기를 539×140 으로 바꾼다.
 */
export const logo = {
  src: "/brand/velox-wordmark.svg",
  width: 672,
  height: 100,
} as const;

/** 페이지 주소. 메뉴·푸터·버튼이 모두 여기서 가져간다. */
export const routes = {
  home: "/",
  why: "/why-touch-data",
  product: "/product",
  contact: "/contact",
} as const;

/* -------------------------------------------------------------------------- */
/* 파생 값                                                                      */
/* -------------------------------------------------------------------------- */

export const mailtoHref = `mailto:${site.contactEmail}`;

/** 절대 주소가 필요한 곳(공유 이미지 등)에서 쓰는 사이트 주소 */
export function getSiteUrl(): string {
  if (site.url) return site.url;
  const host =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : (process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL);
  return host ? `https://${host}` : `http://localhost:${process.env.PORT ?? 3000}`;
}
