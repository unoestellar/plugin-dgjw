import { expect } from 'chai';
import { filterManifestXml } from '../../src/utils/manifestFilter.js';

describe('filterManifestXml', () => {
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
    <types>
        <members>ObjA</members>
        <name>CustomObject</name>
    </types>
    <version>62.0</version>
</Package>`;

  it('should keep only allowed types', () => {
    const result = filterManifestXml(sampleXml, ['ApexClass', 'CustomObject']);

    expect(result).to.include('<name>ApexClass</name>');
    expect(result).to.include('<name>CustomObject</name>');
    expect(result).to.not.include('<name>ApexTrigger</name>');
  });

  it('should preserve XML header and version', () => {
    const result = filterManifestXml(sampleXml, ['ApexClass']);

    expect(result).to.include('<?xml version="1.0"');
    expect(result).to.include('<version>62.0</version>');
    expect(result).to.include('</Package>');
  });

  it('should return XML with no types when none match', () => {
    const result = filterManifestXml(sampleXml, ['NonExistent']);

    expect(result).to.not.include('<types>');
    expect(result).to.include('<version>62.0</version>');
  });

  it('should keep all types when all are allowed', () => {
    const result = filterManifestXml(sampleXml, ['ApexClass', 'ApexTrigger', 'CustomObject']);

    expect(result).to.include('<name>ApexClass</name>');
    expect(result).to.include('<name>ApexTrigger</name>');
    expect(result).to.include('<name>CustomObject</name>');
  });

  it('should preserve members within allowed types', () => {
    const result = filterManifestXml(sampleXml, ['ApexClass']);

    expect(result).to.include('<members>ClassA</members>');
    expect(result).to.include('<members>ClassB</members>');
    expect(result).to.not.include('<members>TriggerA</members>');
  });
});
