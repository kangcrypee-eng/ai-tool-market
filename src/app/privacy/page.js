'use client';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/" className="text-xs text-tx-2 hover:text-tx-0 mb-6 inline-flex items-center gap-1">← 홈으로</Link>
      <h1 className="text-xl font-semibold mb-2">개인정보처리방침</h1>
      <p className="text-xs text-tx-3 mb-8">최종 수정일: 2025년 3월 16일</p>

      <div className="space-y-8 text-xs text-tx-2 leading-relaxed">
        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">1. 개인정보의 수집 및 이용 목적</h2>
          <p>crypee(이하 "플랫폼")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행합니다.</p>
          <p className="mt-3 ml-4">• <b className="text-tx-1">회원 가입 및 관리:</b> 회원 식별, 회원자격 유지·관리, 서비스 부정이용 방지</p>
          <p className="ml-4">• <b className="text-tx-1">서비스 제공:</b> 툴 이용 권한 관리, 결제 및 정산, 콘텐츠 제공</p>
          <p className="ml-4">• <b className="text-tx-1">마케팅 및 광고:</b> 신규 서비스 안내, 이벤트 정보 제공 (동의 시)</p>
          <p className="ml-4">• <b className="text-tx-1">서비스 개선:</b> 접속 빈도 파악, 통계적 분석</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">2. 수집하는 개인정보 항목</h2>
          <div className="bg-bg-1 border border-bg-3 rounded-xl p-4 mt-3">
            <div className="space-y-3">
              <div>
                <p className="text-tx-1 font-semibold mb-1">필수 수집 항목</p>
                <p>이메일 주소, 비밀번호(암호화 저장), 이름(닉네임)</p>
              </div>
              <div>
                <p className="text-tx-1 font-semibold mb-1">선택 수집 항목</p>
                <p>프로필 소개(bio)</p>
              </div>
              <div>
                <p className="text-tx-1 font-semibold mb-1">서비스 이용 시 자동 수집</p>
                <p>접속 IP, 브라우저 정보, 접속 일시, 서비스 이용 기록</p>
              </div>
              <div>
                <p className="text-tx-1 font-semibold mb-1">결제 시 수집 (추후 적용)</p>
                <p>결제 기록, 결제 수단 정보 (토스페이먼츠를 통해 처리되며 플랫폼은 카드번호를 직접 저장하지 않습니다)</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
          <p>플랫폼은 이용자의 개인정보를 수집·이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다.</p>
          <p className="mt-3 ml-4">• <b className="text-tx-1">전자상거래법</b> 계약 또는 청약철회 기록: 5년</p>
          <p className="ml-4">• <b className="text-tx-1">전자상거래법</b> 대금결제 및 재화 공급 기록: 5년</p>
          <p className="ml-4">• <b className="text-tx-1">전자상거래법</b> 소비자 불만 또는 분쟁처리 기록: 3년</p>
          <p className="ml-4">• <b className="text-tx-1">통신비밀보호법</b> 접속 로그 기록: 3개월</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">4. 개인정보의 제3자 제공</h2>
          <p>플랫폼은 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:</p>
          <p className="mt-2 ml-4">• 이용자가 사전에 동의한 경우</p>
          <p className="ml-4">• 법령에 의하여 요구되는 경우</p>
          <p className="ml-4">• 결제 처리를 위해 토스페이먼츠에 필요 최소한의 정보를 제공하는 경우</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">5. 개인정보의 파기</h2>
          <p>플랫폼은 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
          <p className="mt-2 ml-4">• <b className="text-tx-1">전자적 파일:</b> 복원이 불가능한 방법으로 영구 삭제</p>
          <p className="ml-4">• <b className="text-tx-1">종이 문서:</b> 분쇄기로 분쇄하거나 소각</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">6. 이용자의 권리와 행사 방법</h2>
          <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다:</p>
          <p className="mt-2 ml-4">• 개인정보 열람 요구</p>
          <p className="ml-4">• 개인정보 정정·삭제 요구</p>
          <p className="ml-4">• 개인정보 처리 정지 요구</p>
          <p className="ml-4">• 회원 탈퇴</p>
          <p className="mt-2">위 권리 행사는 서비스 내 설정 또는 contact@crypee.io를 통해 가능합니다.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">7. 개인정보의 안전성 확보 조치</h2>
          <p>플랫폼은 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
          <p className="mt-2 ml-4">• <b className="text-tx-1">비밀번호 암호화:</b> bcrypt 알고리즘을 사용하여 단방향 암호화 저장</p>
          <p className="ml-4">• <b className="text-tx-1">통신 암호화:</b> HTTPS(SSL/TLS)를 통한 데이터 전송 암호화</p>
          <p className="ml-4">• <b className="text-tx-1">접근 통제:</b> 개인정보에 대한 접근 권한 최소화</p>
          <p className="ml-4">• <b className="text-tx-1">인증 토큰:</b> JWT 기반 httpOnly 쿠키를 사용한 세션 관리</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">8. 쿠키(Cookie)의 사용</h2>
          <p>플랫폼은 로그인 인증을 위해 쿠키를 사용합니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 로그인이 필요한 서비스 이용에 제한이 있을 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">9. 개인정보 보호책임자</h2>
          <div className="bg-bg-1 border border-bg-3 rounded-xl p-4 mt-3">
            <p>이메일: contact@crypee.io</p>
            <p className="mt-1">이용자는 서비스 이용 중 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 위 연락처로 문의하실 수 있습니다.</p>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-tx-0 mb-3">10. 개인정보처리방침의 변경</h2>
          <p>본 개인정보처리방침은 법령, 정책 또는 보안기술의 변경에 따라 내용이 추가, 삭제 및 수정될 수 있으며, 변경 시 서비스 내 공지를 통해 고지합니다.</p>
        </section>
      </div>
    </div>
  );
}
