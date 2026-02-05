import { type TypeSummary } from './manifestParser.js';

/**
 * 각 </types> 태그 직전에 해당 타입의 멤버 수와 범위를 주석으로 삽입합니다.
 *
 * Before:
 *     <types>
 *         <members>Foo</members>
 *         <members>Bar</members>
 *         <name>ApexClass</name>
 *     </types>
 *
 * After:
 *     <types>
 *         <members>Foo</members>
 *         <members>Bar</members>
 *         <name>ApexClass</name>
 *         <!-- ApexClass: 2 members / FROM Foo ~ TO Bar -->
 *     </types>
 */
export function injectXmlComments(xmlContent: string, typeSummaries: TypeSummary[]): string {
  const summaryMap = new Map<string, TypeSummary>();
  for (const summary of typeSummaries) {
    summaryMap.set(summary.name, summary);
  }

  const lines = xmlContent.split('\n');
  const result: string[] = [];

  let currentTypeName: string | null = null;

  for (const line of lines) {
    // <name>TypeName</name> 패턴 감지
    const nameMatch = line.match(/<name>(\w+)<\/name>/);
    if (nameMatch) {
      currentTypeName = nameMatch[1];
    }

    // </types> 태그를 만나면 직전에 주석 삽입
    if (line.trimEnd().endsWith('</types>') && currentTypeName) {
      const summary = summaryMap.get(currentTypeName);
      if (summary) {
        // 현재 </types> 라인의 들여쓰기를 감지하여 주석에 한 단계 더 들여쓰기
        const closingIndentMatch = line.match(/^(\s*)/);
        const closingIndent = closingIndentMatch ? closingIndentMatch[1] : '';
        const commentIndent = closingIndent + '    ';

        const fromTo =
          summary.firstMember && summary.lastMember
            ? ` / FROM ${summary.firstMember} ~ TO ${summary.lastMember}`
            : '';

        const comment = `${commentIndent}<!-- ${summary.name}: ${summary.memberCount} members${fromTo} -->`;
        result.push(comment);
      }
      currentTypeName = null;
    }

    result.push(line);
  }

  return result.join('\n');
}
