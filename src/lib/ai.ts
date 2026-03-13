import { ClusterResult } from '@/types'

/** Claude API 응답에서 클러스터 결과를 파싱한다 */
export function parseClusterResponse(raw: string): ClusterResult {
  // Claude가 마크다운 코드 블록으로 감싸는 경우 제거
  const cleaned = raw
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  const parsed = JSON.parse(cleaned)

  if (!parsed.groups || !Array.isArray(parsed.groups)) {
    throw new Error('응답 형식이 올바르지 않습니다: groups 필드가 없습니다')
  }

  return parsed as ClusterResult
}

/** Claude에 전달할 클러스터링 프롬프트를 생성한다 */
export function buildClusterPrompt(
  notes: Array<{ id: string; content: string }>
): string {
  const noteList = notes
    .map((n) => `- ID: ${n.id}, 내용: "${n.content}"`)
    .join('\n')

  return `다음 아이디어들을 유사한 주제별로 그룹화하고 각 그룹에 간결한 이름을 제안하세요.

아이디어 목록:
${noteList}

다음 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:
{
  "groups": [
    {
      "groupId": "group-0",
      "groupName": "그룹 이름",
      "noteIds": ["note-id-1", "note-id-2"]
    }
  ]
}

규칙:
- 모든 Note ID는 반드시 응답에 포함되어야 합니다
- 각 Note ID는 정확히 하나의 그룹에만 속해야 합니다
- 그룹명은 10자 이내로 간결하게 작성하세요
- 내용이 없는 노트는 "기타" 그룹으로 묶으세요`
}
