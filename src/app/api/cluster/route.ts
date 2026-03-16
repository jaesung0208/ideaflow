import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildClusterPrompt, parseClusterResponse } from '@/lib/ai'
import type { ClusterRequest } from '@/types'

/**
 * 사용자별 요청 카운터
 *
 * 한계: 서버리스(Vercel) 환경에서는 인스턴스별로 독립된 Map을 유지하므로
 * 인스턴스 간 rate limit 공유가 불가능합니다. 이 제한은 클라이언트 측
 * 쿨다운(useCluster)으로 보완합니다.
 * 개선 방안: Upstash Redis 등 외부 KV 스토어를 사용하면 인스턴스 간 공유 가능.
 *
 * 메모리 누수 방지: Map 크기가 MAX_MAP_SIZE 초과 시 만료된 항목을 정리합니다.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const WINDOW_MS = 60 * 1000
const MAX_MAP_SIZE = 1000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()

  // Map이 너무 커지면 만료된 항목 정리
  if (rateLimitMap.size >= MAX_MAP_SIZE) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key)
    }
  }

  const entry = rateLimitMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count += 1
  return true
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude API 키가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    const userId = req.headers.get('x-user-id') ?? 'anonymous'
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'AI 기능은 분당 5회까지만 사용할 수 있습니다' },
        { status: 429 }
      )
    }

    const body: ClusterRequest = await req.json()
    if (!body.notes || body.notes.length < 2) {
      return NextResponse.json(
        { error: '클러스터링하려면 노트가 2개 이상 필요합니다' },
        { status: 400 }
      )
    }

    const client = new Anthropic({ apiKey })
    const prompt = buildClusterPrompt(body.notes)
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = (message.content[0] as { type: string; text: string }).text
    const clusterResult = parseClusterResponse(rawText)

    return NextResponse.json(clusterResult)
  } catch (error) {
    console.error('[/api/cluster] 오류:', error)
    return NextResponse.json(
      { error: 'AI 기능을 일시적으로 사용할 수 없습니다' },
      { status: 500 }
    )
  }
}
