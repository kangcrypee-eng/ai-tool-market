import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'crypee - AI 자동화 툴 커뮤니티 & 마켓';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0e0e10 0%, #16161a 50%, #1e1e22 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 16 }}>⚡</div>
        <div style={{ fontSize: 56, fontWeight: 'bold', color: '#569cd6', marginBottom: 12 }}>crypee</div>
        <div style={{ fontSize: 24, color: '#8a8a96' }}>AI 자동화 툴 커뮤니티 & 마켓</div>
      </div>
    ),
    { ...size }
  );
}
