const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  const admin = await prisma.user.upsert({ where: { email: 'admin@example.com' }, update: {}, create: { email: 'admin@example.com', password: bcrypt.hashSync('admin123', 10), name: '관리자', role: 'ADMIN', bio: 'Platform administrator' } });
  const c1 = await prisma.user.upsert({ where: { email: 'creator1@example.com' }, update: {}, create: { email: 'creator1@example.com', password: bcrypt.hashSync('creator123', 10), name: '김크리에이터', bio: 'AI automation builder' } });
  const c2 = await prisma.user.upsert({ where: { email: 'creator2@example.com' }, update: {}, create: { email: 'creator2@example.com', password: bcrypt.hashSync('creator123', 10), name: '이메이커', bio: 'Data & productivity tools' } });
  const u1 = await prisma.user.upsert({ where: { email: 'user1@example.com' }, update: {}, create: { email: 'user1@example.com', password: bcrypt.hashSync('user123', 10), name: '박유저', bio: 'AI enthusiast' } });

  const ago = (days) => { const d = new Date(); d.setDate(d.getDate() - days); return d; };

  const tools = await Promise.all([
    prisma.tool.create({ data: { name: 'AI 블로그 자동 작성기', description: '키워드만 입력하면 SEO 최적화된 블로그 글을 자동으로 작성해줍니다.', longDescription: 'GPT 기반 키워드 분석 → 경쟁 블로그 참고 → SEO 최적화 글 자동 생성.\n\n주요 기능:\n- 키워드 분석 및 관련 주제 추천\n- SEO 최적화 글 생성\n- 이미지 자동 삽입\n- 워드프레스/티스토리 자동 업로드', category: 'content', creatorId: c1.id, isSubscriptionEnabled: true, subscriptionPrice: 19900, freeTrialDays: 30, publishedAt: ago(45), status: 'APPROVED' } }),
    prisma.tool.create({ data: { name: '고객 문의 자동 분류 봇', description: 'CS 문의를 자동으로 카테고리별로 분류하고 우선순위를 매깁니다.', category: 'automation', creatorId: c1.id, isOneTimeEnabled: true, oneTimePrice: 99000, isSubscriptionEnabled: true, subscriptionPrice: 29900, freeTrialDays: 30, publishedAt: ago(40), status: 'APPROVED' } }),
    prisma.tool.create({ data: { name: '인스타그램 해시태그 생성기', description: '게시물 내용에 맞는 최적의 해시태그를 AI가 추천해줍니다.', category: 'marketing', creatorId: c2.id, isOneTimeEnabled: true, oneTimePrice: 9900, freeTrialDays: 30, publishedAt: ago(50), status: 'APPROVED' } }),
    prisma.tool.create({ data: { name: '엑셀 데이터 정리 자동화', description: '복잡한 엑셀 데이터를 AI가 자동으로 정리, 분석, 시각화합니다.', longDescription: '엑셀 파일 업로드 → 중복 제거, 결측치 처리, 데이터 변환 자동 수행. 피벗 테이블과 차트도 자동 생성.', category: 'data', creatorId: c2.id, isOneTimeEnabled: true, oneTimePrice: 49000, isSubscriptionEnabled: true, subscriptionPrice: 14900, freeTrialDays: 30, publishedAt: ago(8), status: 'APPROVED' } }),
    prisma.tool.create({ data: { name: '회의록 자동 요약 AI', description: '회의 녹음 파일을 올리면 핵심 내용과 액션 아이템을 자동 정리합니다.', category: 'productivity', creatorId: c1.id, isSubscriptionEnabled: true, subscriptionPrice: 9900, freeTrialDays: 30, publishedAt: ago(15), status: 'APPROVED' } }),
    prisma.tool.create({ data: { name: '유튜브 자막 번역기', description: '유튜브 영상 URL만 넣으면 자막을 추출하고 원하는 언어로 번역합니다.', category: 'content', creatorId: c2.id, isOneTimeEnabled: true, oneTimePrice: 29000, freeTrialDays: 30, publishedAt: ago(2), status: 'APPROVED' } }),
    prisma.tool.create({ data: { name: '이메일 뉴스레터 자동 생성', description: 'RSS 피드와 키워드 기반 뉴스레터 콘텐츠 자동 생성.', category: 'marketing', creatorId: c1.id, isOneTimeEnabled: true, oneTimePrice: 39000, isSubscriptionEnabled: true, subscriptionPrice: 12900, freeTrialDays: 30, publishedAt: ago(1), status: 'PENDING' } }),
  ]);

  // Posts
  await prisma.post.createMany({ data: [
    { authorId: c1.id, toolId: tools[0].id, type: 'TOOL_SHARE', title: 'AI 블로그 자동 작성기 v2.0 업데이트!', body: 'SEO 분석 엔진을 전면 개편했습니다. 키워드 밀도 자동 조절, 이미지 자동 삽입, 워드프레스 다이렉트 업로드 기능이 추가됐어요.', tags: ['SEO', '블로그', '자동화'] },
    { authorId: u1.id, type: 'TIP', title: 'GPT API로 블로그 자동화 파이프라인 만들기', body: 'n8n + GPT API + WordPress API를 연결해서 키워드만 넣으면 자동으로 블로그 글이 올라가는 파이프라인을 구축했습니다. 핵심은 프롬프트 체이닝과 결과물 검증 단계를 나누는 것.', tags: ['GPT', 'n8n', '자동화', '파이프라인'] },
    { authorId: c2.id, toolId: tools[3].id, type: 'TOOL_SHARE', title: '엑셀 데이터 정리 자동화 — 30일 무료 체험 시작!', body: '복잡한 엑셀 파일, 이제 AI한테 맡기세요. 중복 제거, 결측치 처리, 피벗 테이블까지 자동 생성. 지금 등록하면 30일 무료!', tags: ['엑셀', '데이터', '무료체험'] },
    { authorId: u1.id, type: 'QUESTION', title: 'n8n vs Make, 어떤 게 더 나을까요?', body: 'AI 자동화 워크플로우 구축하려는데, n8n이랑 Make 중 고민입니다. 비용, 확장성, AI 연동 편의성 기준으로 경험 있으신 분 의견 부탁드려요.', tags: ['n8n', 'Make', '자동화'] },
    { authorId: u1.id, toolId: tools[4].id, type: 'REVIEW', title: '회의록 자동 요약 AI 솔직 후기', body: '2주 써봤는데 진짜 좋습니다. 1시간 회의를 3분 안에 핵심 요약+액션 아이템으로 정리해줘요. 발화자 구분이 가끔 틀리는 건 개선 포인트.', tags: ['회의록', '후기', '생산성'] },
    { authorId: c2.id, toolId: tools[5].id, type: 'TOOL_SHARE', title: '유튜브 자막 번역기 출시! 30일 무료', body: '영상 URL 하나만 넣으면 끝. 자막 추출부터 번역까지 자동. 영어, 일본어, 중국어, 스페인어 지원.', tags: ['유튜브', '번역', '자막'] },
  ]});

  // Comments on tools
  await prisma.comment.createMany({ data: [
    { userId: u1.id, toolId: tools[0].id, content: '블로그 운영 시간이 반으로 줄었어요. 강추!', rating: 5 },
    { userId: c2.id, toolId: tools[0].id, content: '퀄리티가 생각보다 좋습니다.', rating: 4 },
    { userId: u1.id, toolId: tools[1].id, content: 'CS팀 업무 효율이 크게 개선되었습니다.', rating: 5 },
    { userId: u1.id, toolId: tools[4].id, content: '회의 후 정리 시간이 거의 없어졌어요!', rating: 5 },
  ]});

  console.log('✅ Done!');
  console.log('\nTest accounts:');
  console.log('  Admin:    admin@example.com / admin123');
  console.log('  Creator1: creator1@example.com / creator123');
  console.log('  Creator2: creator2@example.com / creator123');
  console.log('  User:     user1@example.com / user123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
