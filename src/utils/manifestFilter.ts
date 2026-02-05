/**
 * package.xml에서 지정된 타입만 남기고 나머지 <types> 블록을 제거합니다.
 * 원본 XML의 들여쓰기와 포맷을 그대로 유지합니다.
 */
export function filterManifestXml(xmlContent: string, allowedTypes: string[]): string {
  const allowedSet = new Set(allowedTypes);
  const lines = xmlContent.split('\n');
  const result: string[] = [];

  let inTypesBlock = false;
  let currentBlock: string[] = [];
  let currentTypeName: string | null = null;

  for (const line of lines) {
    if (line.trim().startsWith('<types>')) {
      inTypesBlock = true;
      currentBlock = [line];
      currentTypeName = null;
      continue;
    }

    if (inTypesBlock) {
      currentBlock.push(line);

      const nameMatch = line.match(/<name>(\w+)<\/name>/);
      if (nameMatch) {
        currentTypeName = nameMatch[1];
      }

      if (line.trim().startsWith('</types>')) {
        inTypesBlock = false;
        if (currentTypeName && allowedSet.has(currentTypeName)) {
          result.push(...currentBlock);
        }
        currentBlock = [];
        currentTypeName = null;
      }
      continue;
    }

    result.push(line);
  }

  return result.join('\n');
}
