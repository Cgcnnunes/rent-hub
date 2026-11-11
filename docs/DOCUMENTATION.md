# Workflow and script documentation standard

Document behavior that exists today separately from plans. Write for someone
new to the repository, link to the source, and update the documentation in
the same change as the behavior it describes.

## Workflow READMEs

Create `docs/workflows/<workflow-file-name-without-extension>/README.md` for
each GitHub Actions workflow and link it from the repository README. Use the
following chapters in order:

1. **Purpose**: what the workflow protects or accomplishes; link its source.
2. **Trigger and concurrency**: events, branch or manual restrictions, and
   cancellation or serialization behavior.
3. **Inputs and outputs**: event data, configuration, permissions, secrets,
   artifacts, status checks, and any externally visible effects.
4. **Flow**: jobs, conditions, dependencies, and a Mermaid diagram showing
   the actual paths, including skips or parallel work.
5. **Failure and troubleshooting**: how failures affect the result and how
   to investigate or retry safely.
6. **Verification**: relevant local checks and any behavior that requires a
   GitHub Actions run to verify.
7. **Related documentation**: links to relevant guides and scripts.

Say “none” or “not applicable” when a chapter does not apply; do not imply
planned workflows or infrastructure exist. Name the README's title after
the workflow, and keep the diagram in sync with its jobs.

## Script READMEs

Document each executable or test script in [`scripts/README.md`](../scripts/README.md),
or in a separate README linked from that index when a script needs more space.
For every script, use the following chapters in order:

1. **Purpose**: what the script does and a link to its source.
2. **Invocation**: how it is called and prerequisites; identify scripts that
   should normally be invoked by a hook or CI rather than manually.
3. **Inputs and outputs**: arguments, environment, standard input/output,
   files, and side effects, as applicable.
4. **Behavior**: important steps and conditions. Add a Mermaid diagram if it
   makes the control flow clearer; diagrams are optional for scripts.
5. **Failure and verification**: failure behavior, troubleshooting, and
   relevant test commands or coverage limitations.
6. **Related documentation**: links to callers, tests, and other guides.

Use the same chapters even for tests, saying “none” where appropriate. Update
the index when scripts are added, renamed, or removed. Configuration files are
not scripts, but should be described when they affect how scripts run.
