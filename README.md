# AI Tool Market v2 — Community + Market

AI 자동화 툴 커뮤니티 & 마켓 플랫폼. 다크 테마, 커뮤니티/마켓 듀얼 모드, 통합 프로필, 30일 무료 체험.

## Quick Start

```bash
npm install
cp .env.example .env        # DB URL, JWT_SECRET, 토스 키 설정
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev                  # http://localhost:3000
```

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Creator | creator1@example.com | creator123 |
| Creator | creator2@example.com | creator123 |
| User | user1@example.com | user123 |

## What Changed (v1 → v2)

### Community/Market 듀얼 모드
홈 화면 상단에서 Community ↔ Market 전환. Community는 피드(툴 공유, 팁, Q&A, 후기), Market은 카드 그리드.

### 30일 무료 체험
모든 툴은 등록 후 30일간 무료 공개. 무료 기간 중 결제 버튼 대신 "Free trial · Xd left" 표시. 크리에이터가 freeTrialDays를 직접 설정 가능.

### 통합 프로필 (마이페이지 = 크리에이터)
누구나 "My" 한 곳에서: 내가 만든 툴 + 수익, 구매한 툴, 구독, 작성한 글, 결제 내역 전부 관리. 역할 구분(USER/CREATOR) 없이 누구나 툴 등록 가능.

### 커뮤니티
- 게시글 타입: TOOL_SHARE, TIP, QUESTION, REVIEW
- 좋아요, 댓글
- 게시글에 툴 카드 임베딩

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          Login, register, logout, me
│   │   ├── tools/         Tool CRUD + comments
│   │   ├── posts/         Community posts + likes + comments
│   │   ├── payments/      One-time purchase confirm
│   │   ├── subscriptions/ Subscribe, cancel
│   │   ├── my/            Unified profile data
│   │   └── admin/         Admin stats, tool approval
│   ├── page.js            Home (Community/Market dual)
│   ├── login/             Login
│   ├── register/          Register
│   ├── tool/[id]/         Tool detail + buy/subscribe
│   ├── my/                Unified profile
│   └── admin/             Admin dashboard
├── components/
│   ├── AuthProvider.js
│   ├── Header.js
│   ├── ToolCard.js
│   └── PostCard.js
└── lib/
    ├── prisma.js
    ├── auth.js
    └── payment.js          Fee calc + free trial + Toss API
```

## Payment Flow

### Free Trial (30 days)
Tool registered → 30d free for everyone → after trial, pay to access.

### One-time: User clicks buy → Toss SDK → /api/payments/confirm → ownership recorded
### Subscription: User clicks subscribe → Toss billing → /api/subscriptions → cron renews monthly

### Fee: 10,000원 → PG 3% (300) + Platform 20% (2,000) → Creator gets 7,700원

## Cron
```bash
0 6 * * * cd /path && node scripts/billing-cron.js >> billing.log 2>&1
```

## Tech Stack
Next.js 14 (App Router) + PostgreSQL + Prisma + Tailwind CSS (dark) + Toss Payments
