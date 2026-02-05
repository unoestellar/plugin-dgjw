import { XMLParser } from 'fast-xml-parser';

export type TypeSummary = {
  name: string;
  memberCount: number;
  members: string[];
  firstMember: string;
  lastMember: string;
};

/**
 * package.xml 문자열을 파싱하여 각 타입별 멤버 수를 집계합니다.
 *
 * - <types>와 <members>는 항상 배열로 처리
 * - 결과는 타입명 알파벳순 정렬
 * - <members>*</members> 와일드카드도 1개의 멤버로 카운트
 */
export function parseManifestXml(xmlContent: string): TypeSummary[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    isArray: (_name: string, jpath: string) => {
      return jpath === 'Package.types' || jpath === 'Package.types.members';
    },
  });

  const parsed = parser.parse(xmlContent) as Record<string, unknown>;
  const pkg = (parsed['Package'] ?? parsed['package']) as
    | { types?: Array<{ name: string; members?: string[] | string }>; version?: string }
    | undefined;

  if (!pkg?.types) {
    return [];
  }

  const typesArray = pkg.types;

  const summaries: TypeSummary[] = typesArray
    .map((typeEntry) => {
      const name = typeEntry.name;
      let members: string[];

      if (!typeEntry.members) {
        members = [];
      } else if (Array.isArray(typeEntry.members)) {
        members = typeEntry.members.map(String);
      } else {
        members = [String(typeEntry.members)];
      }

      return {
        name,
        memberCount: members.length,
        members,
        firstMember: members[0] ?? '',
        lastMember: members[members.length - 1] ?? '',
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return summaries;
}
