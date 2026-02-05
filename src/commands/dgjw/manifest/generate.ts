import { resolve, join, basename } from 'node:path';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ComponentSet } from '@salesforce/source-deploy-retrieve';
import { parseManifestXml, type TypeSummary } from '../../../utils/manifestParser.js';
import { generateMarkdownReport } from '../../../utils/reportGenerator.js';
import { injectXmlComments } from '../../../utils/xmlCommentInjector.js';
import { findLatestReport, parseReportChecks } from '../../../utils/reportReader.js';
import { filterManifestXml } from '../../../utils/manifestFilter.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('plugin-dgjw', 'dgjw.manifest.generate');

export type ManifestGenerateResult = {
  manifestPath: string;
  reportPath: string;
  totalTypes: number;
  totalMembers: number;
  filtered: boolean;
  types: TypeSummary[];
};

export class ManifestGenerate extends SfCommand<ManifestGenerateResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'from-org': Flags.requiredOrg({
      char: 'o',
      summary: messages.getMessage('flags.from-org.summary'),
      required: true,
    }),
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.name.summary'),
      default: 'fullManifest.xml',
    }),
    'output-dir': Flags.directory({
      char: 'd',
      summary: messages.getMessage('flags.output-dir.summary'),
      default: './manifest',
    }),
    'api-version': Flags.orgApiVersion({
      summary: messages.getMessage('flags.api-version.summary'),
    }),
  };

  public async run(): Promise<ManifestGenerateResult> {
    const { flags } = await this.parse(ManifestGenerate);

    const org = flags['from-org'];
    const fileName = flags['name'];
    const outputDir = resolve(flags['output-dir']);
    const connection = org.getConnection(flags['api-version']);

    // Step 1: 출력 디렉토리 생성
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Step 2: 기존 리포트에서 체크된 타입 확인
    let checkedTypeNames: string[] | null = null;
    const latestReport = findLatestReport(outputDir);

    if (latestReport) {
      const checks = parseReportChecks(latestReport);
      const checkedOnly = checks.filter((c) => c.checked);
      const uncheckedExists = checks.some((c) => !c.checked);

      if (uncheckedExists && checkedOnly.length > 0) {
        checkedTypeNames = checkedOnly.map((c) => c.name);
        this.log(`Previous report found: ${latestReport}`);
        this.log(`Filtering to ${checkedOnly.length} checked types (${checks.length - checkedOnly.length} excluded).`);
      }
    }

    // Step 3: Org에서 Full Manifest 생성
    this.spinner.start(messages.getMessage('info.generating', [org.getUsername() ?? 'unknown']));

    const componentSet = await ComponentSet.fromConnection({
      usernameOrConnection: connection,
    });

    let rawXml = await componentSet.getPackageXml(4);

    this.spinner.stop();

    // Step 4: 체크된 타입만 필터링 (기존 리포트가 있고 일부 타입이 해제된 경우)
    const filtered = checkedTypeNames !== null;
    if (checkedTypeNames) {
      rawXml = filterManifestXml(rawXml, checkedTypeNames);
    }

    // Step 5: XML 파싱 및 분석
    this.spinner.start(messages.getMessage('info.analyzing'));

    const typeSummaries = parseManifestXml(rawXml);

    if (typeSummaries.length === 0) {
      this.error(messages.getMessage('error.no-components'));
    }

    const totalTypes = typeSummaries.length;
    const totalMembers = typeSummaries.reduce((sum, t) => sum + t.memberCount, 0);

    this.spinner.stop();

    // Step 6: XML에 주석 삽입
    const annotatedXml = injectXmlComments(rawXml, typeSummaries);

    // Step 7: 매니페스트 파일 쓰기
    const manifestPath = join(outputDir, fileName);
    writeFileSync(manifestPath, annotatedXml, 'utf-8');
    this.log(`Manifest written: ${manifestPath}`);

    // Step 8: Markdown 리포트 생성 (YYYYMMDD-HHmm 타임스탬프 접두사)
    const now = new Date();
    const pad = (n: number): string => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    const manifestBaseName = basename(fileName, '.xml');
    const reportFileName = `${timestamp}_${manifestBaseName}_report.md`;
    const reportPath = join(outputDir, reportFileName);

    const reportContent = generateMarkdownReport({
      orgAlias: org.getUsername() ?? 'unknown',
      fileName,
      types: typeSummaries,
      totalTypes,
      totalMembers,
    });

    writeFileSync(reportPath, reportContent, 'utf-8');
    this.log(messages.getMessage('info.writing-report', [reportPath]));

    // Step 9: 요약 출력
    this.log('');
    if (filtered) {
      this.log(`Filtered manifest: ${totalTypes} types selected.`);
    }
    this.log(messages.getMessage('info.types-found', [totalTypes, totalMembers]));
    this.log(messages.getMessage('info.complete'));

    return {
      manifestPath,
      reportPath,
      totalTypes,
      totalMembers,
      filtered,
      types: typeSummaries,
    };
  }
}

export default ManifestGenerate;
