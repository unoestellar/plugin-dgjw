import { expect } from 'chai';
import { generateMarkdownReport } from '../../src/utils/reportGenerator.js';

describe('generateMarkdownReport', () => {
  const types = [
    { name: 'CustomObject', memberCount: 5, members: [], firstMember: '', lastMember: '' },
    { name: 'ApexClass', memberCount: 10, members: [], firstMember: '', lastMember: '' },
  ];

  it('should generate valid markdown with Include column and checkboxes', () => {
    const report = generateMarkdownReport({
      orgAlias: 'testOrg',
      fileName: 'fullManifest.xml',
      types,
      totalTypes: 2,
      totalMembers: 15,
    });

    expect(report).to.include('# Manifest Analysis Report');
    expect(report).to.include('**Org**: testOrg');
    expect(report).to.include('| Include |');
    expect(report).to.include('| [x] |');
  });

  it('should sort types by memberCount ascending', () => {
    const report = generateMarkdownReport({
      orgAlias: 'testOrg',
      fileName: 'test.xml',
      types,
      totalTypes: 2,
      totalMembers: 15,
    });

    const lines = report.split('\n');
    const dataLines = lines.filter((l) => l.match(/\| \[x\] \|/));

    // CustomObject (5) should come before ApexClass (10)
    expect(dataLines[0]).to.include('CustomObject');
    expect(dataLines[1]).to.include('ApexClass');
  });

  it('should include usage instructions for checkboxes', () => {
    const report = generateMarkdownReport({
      orgAlias: 'org',
      fileName: 'test.xml',
      types: [],
      totalTypes: 0,
      totalMembers: 0,
    });

    expect(report).to.include('[x]` to include');
    expect(report).to.include('[ ]` to exclude');
  });
});
