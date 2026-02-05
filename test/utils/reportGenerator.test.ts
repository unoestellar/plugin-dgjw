import { expect } from 'chai';
import { generateMarkdownReport } from '../../src/utils/reportGenerator.js';

describe('generateMarkdownReport', () => {
  const types = [
    { name: 'ApexClass', memberCount: 50, members: [], firstMember: '', lastMember: '' },
    { name: 'ApexTrigger', memberCount: 10, members: [], firstMember: '', lastMember: '' },
    { name: 'CustomObject', memberCount: 30, members: [], firstMember: '', lastMember: '' },
    { name: 'Layout', memberCount: 20, members: [], firstMember: '', lastMember: '' },
  ];

  it('should split into Default Components and Other Components sections', () => {
    const report = generateMarkdownReport({
      orgAlias: 'testOrg',
      fileName: 'fullManifest.xml',
      types,
      totalTypes: 4,
      totalMembers: 110,
    });

    expect(report).to.include('## Default Components');
    expect(report).to.include('## Other Components');
  });

  it('should place ApexClass and ApexTrigger in Default, others in Other', () => {
    const report = generateMarkdownReport({
      orgAlias: 'testOrg',
      fileName: 'test.xml',
      types,
      totalTypes: 4,
      totalMembers: 110,
    });

    // Default section: between "## Default" and "## Other"
    const defaultSection = report.split('## Other Components')[0];
    const otherSection = report.split('## Other Components')[1];

    expect(defaultSection).to.include('ApexClass');
    expect(defaultSection).to.include('ApexTrigger');
    expect(otherSection).to.include('CustomObject');
    expect(otherSection).to.include('Layout');
  });

  it('should sort each section by memberCount descending', () => {
    const report = generateMarkdownReport({
      orgAlias: 'testOrg',
      fileName: 'test.xml',
      types,
      totalTypes: 4,
      totalMembers: 110,
    });

    // Default section: ApexClass(50) before ApexTrigger(10)
    const defaultSection = report.split('## Other Components')[0];
    const defaultLines = defaultSection.split('\n').filter((l) => l.match(/\| \[x\] \|/));
    expect(defaultLines[0]).to.include('ApexClass');
    expect(defaultLines[1]).to.include('ApexTrigger');

    // Other section: CustomObject(30) before Layout(20)
    const otherSection = report.split('## Other Components')[1];
    const otherLines = otherSection.split('\n').filter((l) => l.match(/\| \[x\] \|/));
    expect(otherLines[0]).to.include('CustomObject');
    expect(otherLines[1]).to.include('Layout');
  });

  it('should show subtotals for each section', () => {
    const report = generateMarkdownReport({
      orgAlias: 'testOrg',
      fileName: 'test.xml',
      types,
      totalTypes: 4,
      totalMembers: 110,
    });

    expect(report).to.include('**Subtotal: 2 types**');
    expect(report).to.include('**60**');  // ApexClass(50) + ApexTrigger(10)
    expect(report).to.include('**50**');  // CustomObject(30) + Layout(20)
  });

  it('should include checkboxes in both tables', () => {
    const report = generateMarkdownReport({
      orgAlias: 'org',
      fileName: 'test.xml',
      types,
      totalTypes: 4,
      totalMembers: 110,
    });

    const checkboxLines = report.split('\n').filter((l) => l.includes('| [x] |'));
    expect(checkboxLines).to.have.lengthOf(4);
  });

  it('should handle case with no default types', () => {
    const otherOnly = [
      { name: 'CustomObject', memberCount: 5, members: [], firstMember: '', lastMember: '' },
    ];

    const report = generateMarkdownReport({
      orgAlias: 'org',
      fileName: 'test.xml',
      types: otherOnly,
      totalTypes: 1,
      totalMembers: 5,
    });

    expect(report).to.include('*No default component types found.*');
    expect(report).to.include('CustomObject');
  });
});
