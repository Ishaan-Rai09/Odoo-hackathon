import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const width = searchParams.get('w') || '400'
  const height = searchParams.get('h') || '300'
  
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a2e"/>
      <rect width="100%" height="100%" fill="url(#grid)" opacity="0.1"/>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00d4ff" stroke-width="0.5"/>
        </pattern>
      </defs>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#00d4ff" text-anchor="middle" dy="0.3em">
        ${width}×${height}
      </text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
