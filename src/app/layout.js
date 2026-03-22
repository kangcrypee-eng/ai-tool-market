import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: { default: 'crypee - AI 자동화 툴 커뮤니티 & 마켓', template: '%s | crypee' },
  description: 'AI 자동화 툴을 만들고, 공유하고, 함께 성장하는 커뮤니티 플랫폼',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://crypee-ai.vercel.app'),
  openGraph: {
    siteName: 'crypee',
    type: 'website',
    locale: 'ko_KR',
    title: 'crypee - AI 자동화 툴 커뮤니티 & 마켓',
    description: 'AI 자동화 툴을 만들고, 공유하고, 함께 성장하는 커뮤니티 플랫폼',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <Header />
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
