import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export type CheckedType = {
  name: string;
  checked: boolean;
};

/**
 * 출력 디렉토리에서 가장 최근의 *_report.md 파일 경로를 반환합니다.
 * 없으면 null을 반환합니다.
 */
export function findLatestReport(outputDir: string): string | null {
  let files: string[];
  try {
    files = readdirSync(outputDir).filter((f) => f.endsWith('_report.md'));
  } catch {
    return null;
  }

  if (files.length === 0) return null;

  // 파일명에 YYYYMMDD-HHmm 타임스탬프가 접두사로 있으므로 알파벳순 정렬 = 시간순
  files.sort();
  return join(outputDir, files[files.length - 1]);
}

/**
 * 리포트 MD 파일에서 Include 컬럼의 [x] / [ ] 체크 상태를 파싱합니다.
 *
 * 테이블 행 형식: | [x] | 1 | ApexClass | 142 |
 */
export function parseReportChecks(reportPath: string): CheckedType[] {
  const content = readFileSync(reportPath, 'utf-8');
  const lines = content.split('\n');
  const result: CheckedType[] = [];

  for (const line of lines) {
    const match = line.match(/\|\s*\[([ xX]?)\]\s*\|\s*\d+\s*\|\s*(\S+)\s*\|/);
    if (match) {
      result.push({
        name: match[2],
        checked: match[1].toLowerCase() === 'x',
      });
    }
  }

  return result;
}
