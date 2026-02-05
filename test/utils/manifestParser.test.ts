import { expect } from 'chai';
import { parseManifestXml } from '../../src/utils/manifestParser.js';

describe('parseManifestXml', () => {
  it('should parse multiple types and count members correctly', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>AccountController</members>
        <members>ContactService</members>
        <members>OpportunityHelper</members>
        <name>ApexClass</name>
    </types>
    <types>
        <members>AccountTrigger</members>
        <name>ApexTrigger</name>
    </types>
    <version>62.0</version>
</Package>`;

    const result = parseManifestXml(xml);

    expect(result).to.have.lengthOf(2);

    // 알파벳순 정렬 확인
    expect(result[0].name).to.equal('ApexClass');
    expect(result[0].memberCount).to.equal(3);
    expect(result[0].firstMember).to.equal('AccountController');
    expect(result[0].lastMember).to.equal('OpportunityHelper');

    expect(result[1].name).to.equal('ApexTrigger');
    expect(result[1].memberCount).to.equal(1);
    expect(result[1].firstMember).to.equal('AccountTrigger');
    expect(result[1].lastMember).to.equal('AccountTrigger');
  });

  it('should handle single member (non-array edge case)', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>OnlyOne</members>
        <name>ApexClass</name>
    </types>
    <version>62.0</version>
</Package>`;

    const result = parseManifestXml(xml);

    expect(result).to.have.lengthOf(1);
    expect(result[0].memberCount).to.equal(1);
    expect(result[0].firstMember).to.equal('OnlyOne');
    expect(result[0].lastMember).to.equal('OnlyOne');
  });

  it('should handle wildcard member (*)', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>*</members>
        <name>CustomObject</name>
    </types>
    <version>62.0</version>
</Package>`;

    const result = parseManifestXml(xml);

    expect(result).to.have.lengthOf(1);
    expect(result[0].name).to.equal('CustomObject');
    expect(result[0].memberCount).to.equal(1);
    expect(result[0].firstMember).to.equal('*');
  });

  it('should return empty array for empty XML', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <version>62.0</version>
</Package>`;

    const result = parseManifestXml(xml);
    expect(result).to.have.lengthOf(0);
  });

  it('should sort results alphabetically by type name', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>A</members>
        <name>CustomObject</name>
    </types>
    <types>
        <members>B</members>
        <name>ApexClass</name>
    </types>
    <types>
        <members>C</members>
        <name>Layout</name>
    </types>
    <version>62.0</version>
</Package>`;

    const result = parseManifestXml(xml);

    expect(result[0].name).to.equal('ApexClass');
    expect(result[1].name).to.equal('CustomObject');
    expect(result[2].name).to.equal('Layout');
  });
});
