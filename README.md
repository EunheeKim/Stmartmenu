# SmartMenu

외국인 관광객을 위한 QR 코드 기반 디지털 메뉴 서비스. 식당 주인이 메뉴를 등록하고 QR 코드를 생성하면, 관광객이 스마트폰으로 스캔해 다국어 메뉴를 보고 주문할 수 있습니다.

## 주요 기능

- **식당 관리**: 식당 정보 등록 및 고유 슬러그 설정
- **메뉴 관리**: 카테고리별 메뉴 아이템 등록 (한국어/영어)
- **QR 코드**: 테이블별 QR 코드 자동 생성 및 다운로드
- **고객 주문**: QR 스캔 → 다국어 메뉴 보기 → 주문 접수
- **주문 관리**: 대시보드에서 실시간 주문 확인 및 상태 변경
- **이메일 알림**: 새 주문 시 식당 주인에게 이메일 발송 (Resend)

## 기술 스택

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Supabase (Auth, Database, RLS)
- **이메일**: Resend
- **QR 코드**: qrcode
- **배포**: Vercel (권장)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 아래 값을 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
```

### 3. Supabase 데이터베이스 설정

Supabase 프로젝트의 SQL Editor에서 `supabase/schema.sql` 파일을 실행하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000` 에서 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── auth/          # 로그인/회원가입
│   ├── dashboard/     # 식당 관리 대시보드
│   │   ├── menu/      # 메뉴 관리
│   │   ├── orders/    # 주문 관리
│   │   └── qr/        # QR 코드 생성
│   ├── m/[slug]/      # 고객용 메뉴 페이지
│   └── api/
│       ├── orders/    # 주문 접수 API
│       └── qr/        # QR 코드 생성 API
└── lib/
    ├── supabase/      # Supabase 클라이언트
    └── types.ts       # 타입 정의
```

## 사용 흐름

1. 식당 주인이 회원가입 후 식당 정보 등록
2. 메뉴 카테고리와 아이템 등록 (한국어/영어)
3. QR 코드 생성 후 테이블에 부착
4. 관광객이 QR 스캔 → `/m/{slug}?table=1` 접속
5. 메뉴 확인 후 주문 → 식당 주인 대시보드에서 확인
