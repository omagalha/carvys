import { ImageResponse } from 'next/og'

export const size        = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0F',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
        }}
      >
        <span
          style={{
            color: '#C8F135',
            fontSize: '21px',
            fontWeight: 900,
            fontFamily: 'sans-serif',
            letterSpacing: '-1px',
            lineHeight: 1,
          }}
        >
          C
        </span>
      </div>
    ),
    { ...size },
  )
}
