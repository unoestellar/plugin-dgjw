# summary

Generate a full metadata manifest from a Salesforce org with analysis report.

# description

Queries all metadata types from the target org, generates a complete package.xml manifest, analyzes component counts per type, and produces a markdown summary report. Each `<types>` block in the manifest receives a comment showing its member count and range.

# examples

- Generate a manifest from the default org:

  <%= config.bin %> <%= command.id %> --from-org myOrg

- Generate with a custom file name and output directory:

  <%= config.bin %> <%= command.id %> --from-org myOrg --name fullManifest.xml --output-dir ./manifest

# flags.from-org.summary

Username or alias of the Salesforce org to generate the manifest from.

# flags.name.summary

File name for the generated manifest (default: fullManifest.xml).

# flags.output-dir.summary

Directory to write the manifest and report files to (default: ./manifest). Created automatically if it does not exist.

# flags.api-version.summary

Override the API version used to query metadata types.

# info.generating

Generating full manifest from org: %s

# info.analyzing

Analyzing manifest components...

# info.writing-report

Writing analysis report: %s

# info.complete

Manifest generation complete.

# info.types-found

Found %d metadata types with %d total members.

# error.no-components

No metadata components found in the target org.
