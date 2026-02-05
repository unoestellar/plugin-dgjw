# 🇰🇷 plugin-dgjw

**Da Ga Jeo Wa (다 가져 와)** - Salesforce org manifest analyzer plugin.

Salesforce Org의 전체 메타데이터를 조회하여 manifest(package.xml)를 생성하고, 타입별 컴포넌트 개수를 분석한 Markdown 리포트와 XML 주석을 자동으로 만들어주는 SF CLI 플러그인입니다.

[![npm](https://img.shields.io/npm/v/plugin-dgjw)](https://www.npmjs.com/package/plugin-dgjw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What It Does

하나의 커맨드로 세 가지를 동시에 수행합니다:

1. **Full Manifest 생성** - Org의 모든 메타데이터 타입을 조회하여 `package.xml` 생성
2. **Markdown 리포트** - 타입별 컴포넌트 개수를 테이블로 정리한 `.md` 파일 생성
3. **XML 주석 삽입** - 각 `</types>` 직전에 멤버 수와 범위를 주석으로 표기

### Output Example

```
./manifest/
├── fullManifest.xml                         # 주석이 삽입된 전체 manifest
└── 20260205-1430_fullManifest_report.md     # 타입별 분석 리포트
```

**XML 주석:**
```xml
<types>
    <members>AccountController</members>
    <members>ContactService</members>
    <members>OpportunityHelper</members>
    <!-- ApexClass: 3 members / FROM AccountController ~ TO OpportunityHelper -->
</types>
```

**Markdown 리포트:**

| # | Metadata Type | Members Count |
|--:|---------------|-------------:|
| 1 | ApexClass | 142 |
| 2 | ApexTrigger | 38 |
| 3 | CustomObject | 67 |
| | **Total: 25 types** | **1,284** |

---

## Prerequisites

- [Salesforce CLI (sf)](https://developer.salesforce.com/tools/salesforcecli) v2 이상
- Node.js >= 18
- 대상 Org에 인증되어 있어야 합니다 (`sf org login web --alias myOrg`)

---

## Install

```bash
sf plugins install plugin-dgjw
# "isn't signed by Salesforce" 경고가 뜨면 y 입력
```

경고 없이 설치하려면:

```bash
sf plugins install plugin-dgjw --force
```

설치 확인:

```bash
sf plugins
sf dgjw manifest generate --help
```

### Update

```bash
sf plugins install plugin-dgjw
```

동일 명령으로 최신 버전이 자동 설치됩니다. 현재 버전 확인은 `sf plugins`로 할 수 있습니다.

---

## Usage

### Basic

```bash
sf dgjw manifest generate --from-org myOrg
```

기본적으로 `./manifest/` 폴더에 `fullManifest.xml`과 리포트가 생성됩니다.

### Custom Options

```bash
sf dgjw manifest generate \
  --from-org myOrg \
  --name fullManifest.xml \
  --output-dir ./my-output
```

### JSON Output

```bash
sf dgjw manifest generate --from-org myOrg --json
```

### Flags

| Flag | Short | Required | Default | Description |
|------|-------|----------|---------|-------------|
| `--from-org` | `-o` | Yes | - | Org username or alias |
| `--name` | `-n` | No | `fullManifest.xml` | Manifest file name |
| `--output-dir` | `-d` | No | `./manifest` | Output directory (auto-created) |
| `--api-version` | - | No | Org default | API version override |
| `--json` | - | No | - | Output result as JSON |

---

## Commands

<!-- commands -->
* [`sf dgjw manifest generate`](#sf-dgjw-manifest-generate)

## `sf dgjw manifest generate`

Generate a full metadata manifest from a Salesforce org with analysis report.

```
USAGE
  $ sf dgjw manifest generate -o <value> [--json] [--flags-dir <value>] [-n <value>] [-d <value>] [--api-version
  <value>]

FLAGS
  -d, --output-dir=<value>   [default: ./manifest] Directory to write the manifest and report files to (default:
                             ./manifest). Created automatically if it does not exist.
  -n, --name=<value>         [default: fullManifest.xml] File name for the generated manifest (default:
                             fullManifest.xml).
  -o, --from-org=<value>     (required) Username or alias of the Salesforce org to generate the manifest from.
      --api-version=<value>  Override the API version used to query metadata types.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Generate a full metadata manifest from a Salesforce org with analysis report.

  Queries all metadata types from the target org, generates a complete package.xml manifest, analyzes component counts
  per type, and produces a markdown summary report. Each `<types>` block in the manifest receives a comment showing its
  member count and range.

EXAMPLES
  Generate a manifest from the default org:

    $ sf dgjw manifest generate --from-org myOrg

  Generate with a custom file name and output directory:

    $ sf dgjw manifest generate --from-org myOrg --name fullManifest.xml --output-dir ./manifest

FLAG DESCRIPTIONS
  --api-version=<value>  Override the API version used to query metadata types.

    Override the api version used for api requests made by this command
```

_See code: [src/commands/dgjw/manifest/generate.ts](https://github.com/unoestellar/plugin-dgjw/blob/v1.1.0/src/commands/dgjw/manifest/generate.ts)_
<!-- commandsstop -->

---

## Uninstall

```bash
sf plugins uninstall plugin-dgjw
```

---

## Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m "feat: add my feature"`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a Pull Request

### Local Development

```bash
git clone https://github.com/unoestellar/plugin-dgjw.git
cd plugin-dgjw
npm install
npm run build
npm test

# Link to sf CLI for local testing
sf plugins link .
sf dgjw manifest generate --from-org myOrg
```

---

## License

[MIT](LICENSE) - See [LICENSE](LICENSE) file for details.

---

## Author

**ihkim920** - [GitHub](https://github.com/unoestellar)
