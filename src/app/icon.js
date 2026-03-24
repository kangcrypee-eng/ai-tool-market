import { ImageResponse } from 'next/og';

export const size = { width: 128, height: 128 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 128,
          height: 128,
          background: 'linear-gradient(135deg, #16161a 0%, #0e0e10 100%)',
          borderRadius: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <span style={{ fontSize: 64 }}>⚡</span>
      </div>
    ),
    { ...size }
  );
}
