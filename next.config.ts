import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  // @anthropic-ai/sdk는 서버 전용 패키지 — 클라이언트 번들에서 제외
  serverExternalPackages: ['@anthropic-ai/sdk'],
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
