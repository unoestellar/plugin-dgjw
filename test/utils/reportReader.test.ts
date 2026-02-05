import { expect } from 'chai';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { findLatestReport, parseReportChecks } from '../../src/utils/reportReader.js';

describe('reportReader', () => {
  const testDir = join(process.cwd(), 'test', 'tmp-report-test');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('findLatestReport', () => {
    it('should return null when no reports exist', () => {
      const result = findLatestReport(testDir);
      expect(result).to.be.null;
    });

    it('should return null when directory does not exist', () => {
      const result = findLatestReport(join(testDir, 'nonexistent'));
      expect(result).to.be.null;
    });

    it('should return the latest report by filename timestamp', () => {
      writeFileSync(join(testDir, '20260201-0900_full_report.md'), 'old');
      writeFileSync(join(testDir, '20260205-1430_full_report.md'), 'new');
      writeFileSync(join(testDir, '20260203-1200_full_report.md'), 'mid');

      const result = findLatestReport(testDir);
      expect(result).to.equal(join(testDir, '20260205-1430_full_report.md'));
    });
  });

  describe('parseReportChecks', () => {
    it('should parse checked and unchecked types from report', () => {
      const content = [
        '# Manifest Analysis Report',
        '',
        '| Include | # | Metadata Type | Members Count |',
        '|---------|--:|---------------|-------------:|',
        '| [x] | 1 | ApexClass | 10 |',
        '| [ ] | 2 | CustomObject | 5 |',
        '| [x] | 3 | ApexTrigger | 3 |',
        '| | | **Total: 3 types** | **18** |',
      ].join('\n');

      const filePath = join(testDir, 'test_report.md');
      writeFileSync(filePath, content);

      const result = parseReportChecks(filePath);

      expect(result).to.have.lengthOf(3);
      expect(result[0]).to.deep.equal({ name: 'ApexClass', checked: true });
      expect(result[1]).to.deep.equal({ name: 'CustomObject', checked: false });
      expect(result[2]).to.deep.equal({ name: 'ApexTrigger', checked: true });
    });

    it('should return empty array for report with no table rows', () => {
      const filePath = join(testDir, 'empty_report.md');
      writeFileSync(filePath, '# Empty Report\n');

      const result = parseReportChecks(filePath);
      expect(result).to.have.lengthOf(0);
    });
  });
});
