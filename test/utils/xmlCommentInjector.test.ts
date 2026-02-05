import { expect } from 'chai';
import { injectXmlComments } from '../../src/utils/xmlCommentInjector.js';
import { type TypeSummary } from '../../src/utils/manifestParser.js';

describe('injectXmlComments', () => {
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>ClassA</members>
        <members>ClassB</members>
        <name>ApexClass</name>
    </types>
    <types>
        <members>TriggerA</members>
        <name>ApexTrigger</name>
    </types>
    <version>62.0</version>
</Package>`;

  const summaries: TypeSummary[] = [
    { name: 'ApexClass', memberCount: 2, members: ['ClassA', 'ClassB'], firstMember: 'ClassA', lastMember: 'ClassB' },
    {
      name: 'ApexTrigger',
      memberCount: 1,
      members: ['TriggerA'],
      firstMember: 'TriggerA',
      lastMember: 'TriggerA',
    },
  ];

  it('should inject comments with member count and FROM~TO range', () => {
    const result = injectXmlComments(sampleXml, summaries);

    expect(result).to.include('<!-- ApexClass: 2 members / FROM ClassA ~ TO ClassB -->');
    expect(result).to.include('<!-- ApexTrigger: 1 members / FROM TriggerA ~ TO TriggerA -->');
  });

  it('should preserve </types> closing tags', () => {
    const result = injectXmlComments(sampleXml, summaries);

    const closingCount = (result.match(/<\/types>/g) ?? []).length;
    expect(closingCount).to.equal(2);
  });

  it('should insert comment BEFORE </types>', () => {
    const result = injectXmlComments(sampleXml, summaries);
    const lines = result.split('\n');

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trimEnd().endsWith('</types>')) {
        // 직전 라인이 주석이어야 함
        expect(lines[i - 1].trim()).to.match(/^<!--.*-->$/);
      }
    }
  });

  it('should not modify <version> or other non-types elements', () => {
    const result = injectXmlComments(sampleXml, summaries);
    expect(result).to.include('<version>62.0</version>');
  });

  it('should handle XML with no matching summaries gracefully', () => {
    const result = injectXmlComments(sampleXml, []);

    // 주석 없이 원본 유지
    expect(result).to.not.include('<!--');
    expect(result).to.include('</types>');
  });
});
