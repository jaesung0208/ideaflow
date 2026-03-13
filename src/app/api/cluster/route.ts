import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildClusterPrompt, parseClusterResponse } from '@/lib/ai'
import type { ClusterRequest } from '@/types'

/** 사용자별 요청 카운터 (서버리스 환경에서는 인스턴스별 독립 — 클라이언트 쿨다운으로 보완) */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const WINDOW_MS = 60 * 1000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
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
