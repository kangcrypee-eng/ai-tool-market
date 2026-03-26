'use client';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/" className="text-xs text-tx-2 hover:text-tx-0 mb-6 inline-flex items-center gap-1">← 홈으로</Link>
      <h1 className="text-xl font-semibold mb-2">이용약관</h1>
      <p className="text-xs text-tx-3 mb-8">최종 수정일: 2026년 3월 27일</p>

      <div className="space-y-8 text-xs text-tx-2 leading-relaxed">
        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">제1조 (목적)</h2>
          <p>본 약관은 주식회사 크리피솔루션즈(이하 "회사")가 운영하는 crypee(이하 "플랫폼")가 제공하는 AI 자동화 툴 커뮤니티 및 마켓 서비스(이하 "서비스")의 이용과 관련하여, 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">제2조 (정의)</h2>
          <p>① "서비스"란 플랫폼이 제공하는 AI 자동화 툴의 등록, 공유, 판매, 구매, 구독 및 커뮤니티 기능 일체를 의미합니다.</p>
          <p className="mt-2">② "이용자"란 본 약관에 따라 플랫폼이 제공하는 서비스를 이용하는 회원을 의미합니다.</p>
          <p className="mt-2">③ "크리에이터"란 AI 자동화 툴을 제작하여 플랫폼에 등록하는 이용자를 의미합니다.</p>
          <p className="mt-2">④ "툴"이란 크리에이터가 플랫폼에 등록한 AI 자동화 소프트웨어, 스크립트, 워크플로우 또는 관련 콘텐츠를 의미합니다.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">제3조 (약관의 효력 및 변경)</h2>
          <p>① 본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력을 발생합니다.</p>
          <p className="mt-2">② 플랫폼은 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일이 경과한 시점부터 효력을 발생합니다.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">제4조 (회원가입 및 계정)</h2>
          <p>① 이용자는 플랫폼이 정한 양식에 따라 회원정보를 기입한 후 본 약관에 동의하여 회원가입을 신청합니다.</p>
          <p className="mt-2">② 이용자는 등록된 정보를 정확하고 최신의 상태로 유지해야 하며, 타인의 정보를 도용하여서는 안 됩니다.</p>
          <p className="mt-2">③ 이용자는 자신의 계정 정보를 안전하게 관리할 책임이 있으며, 이를 제3자에게 양도하거나 대여할 수 없습니다.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">제5조 (서비스의 제공)</h2>
          <p>① 플랫폼은 다음의 서비스를 제공합니다:</p>
          <p className="mt-2 ml-4">• AI 자동화 툴 등록 및 공유 서비스</p>
          <p className="ml-4">• 툴 구매 및 구독 서비스</p>
          <p className="ml-4">• 커뮤니티 (게시글 작성, 댓글, 좋아요) 서비스</p>
          <p className="ml-4">• 크리에이터 정산 서비스</p>
          <p className="mt-2">② 플랫폼은 서비스의 품질 향상을 위해 사전 공지 후 서비스의 전부 또는 일부를 변경할 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">제6조 (툴 등록 및 판매)</h2>
          <p>① 크리에이터는 플랫폼에 AI 자동화 툴을 등록할 수 있으며, 등록된 툴은 관리자 승인 후 공개됩니다.</p>
          <p className="mt-2">② 크리에이터는 툴의 1회 구매 가격을 자유롭게 설정할 수 있습니다.</p>
          <p className="mt-2">③ 플랫폼은 결제 금액의 20%를 플랫폼 수수료(PG 수수료 포함)로 차감한 후 크리에이터에게 정산합니다.</p>
          <p className="mt-2">④ 크리에이터는 자신이 등록하는 툴에 대한 모든 지식재산권을 보유하고 있거나 적법한 이용 권한이 있음을 보증합니다.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">제7조 (무료 체험)</h2>
          <p>① 신규 등록된 툴은 크리에이터가 설정한 기간(기본 30일) 동안 모든 이용자에게 무료로 제공됩니다.</p>
          <p className="mt-2">② 무료 체험 기간이 종료된 후에는 크리에이터가 설정한 가격에 따라 유료로 전환됩니다.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">제8조 (이용자의 의무)</h2>
          <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
          <p className="mt-2 ml-4">• 타인의 개인정보를 수집, 저장, 공개하는 행위</p>
          <p className="ml-4">• 서비스를 이용하여 법령에 위반되는 행위</p>
          <p className="ml-4">• 플랫폼의 운영을 방해하는 행위</p>
          <p className="ml-4">• 악성코드 또는 유해 프로그램을 배포하는 행위</p>
          <p className="ml-4">• 타인의 지식재산권을 침해하는 행위</p>
          <p className="ml-4">• 허위 정보를 등록하거나 유포하는 행위</p>
          <p className="ml-4">• 구매 또는 열람한 디지털 콘텐츠(파일, 텍스트 콘텐츠, 프롬프트 등)를 무단으로 복제, 재배포, 재판매하는 행위</p>
          <p className="ml-4">• 크리에이터의 텍스트 콘텐츠를 스크래핑, 자동 수집하거나 플랫폼 외부에 공개하는 행위</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">제9조 (서비스 이용 제한)</h2>
          <p>플랫폼은 이용자가 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 사전 통보 후 서비스 이용을 제한하거나 계정을 정지할 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">제10조 (면책조항)</h2>
          <p>① 플랫폼은 크리에이터가 등록한 툴의 정확성, 신뢰성, 적법성에 대해 보증하지 않습니다.</p>
          <p className="mt-2">② 플랫폼은 이용자 간 또는 이용자와 제3자 간에 발생한 분쟁에 대해 개입할 의무를 지지 않습니다.</p>
          <p className="mt-2">③ 플랫폼은 천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">제12조 (환불)</h2>
          <p>① 구매 후 7일 이내, 툴 콘텐츠를 사용하지 않은 경우 전액 환불 가능합니다.</p>
          <p className="mt-2">② 환불 요청은 contact@crypee.io로 접수할 수 있습니다.</p>
          <p className="mt-2">③ 툴의 하자가 있는 경우 결제일로부터 30일 이내 환불 요청이 가능합니다.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">제13조 (준거법 및 관할)</h2>
          <p>본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과 관련한 분쟁은 서울중앙지방법원을 관할법원으로 합니다.</p>
        </section>

        <section className="bg-bg-1 border border-bg-3 rounded-xl p-4 mt-8">
          <p className="text-tx-1 font-semibold mb-2">사업자 정보</p>
          <p className="text-tx-3">주식회사 크리피솔루션즈 | 대표: 민동선</p>
          <p className="text-tx-3">사업자등록번호: 173-87-02739 | 통신판매업 신고번호: 제 2025-서울강남-04832호</p>
          <p className="text-tx-3">주소: 서울특별시 강남구 테헤란로 431, 에스7018호 (삼성동, 저스트코타워)</p>
          <p className="text-tx-3 mt-2">문의: contact@crypee.io | 전화: 010-5077-2773</p>
        </section>
      </div>
    </div>
  );
}
