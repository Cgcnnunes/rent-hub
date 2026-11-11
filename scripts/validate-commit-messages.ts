import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function validateSubject(subject: string): string | null {
  const match = /^(feat|chore|refactor|fix|doc)\(rent-[0-9]{5}\): (.+)$/u.exec(
    subject,
  );

  if (!match) {
    return 'expected type(rent-xxxxx): lowercase description';
  }

  const description = match[2];

  if (!description.trim() || description !== description.toLowerCase()) {
    return 'description must be nonempty and lowercase';
  }

  if ([...description].length > 120) {
    return 'description must not exceed 120 characters';
  }

  return null;
}

interface PullRequestEvent {
  number: number;
  pull_request: {
    base: { sha: string };
    head: { sha: string };
    title: string;
  };
}

function validatePullRequest(event: PullRequestEvent): string[] {
  if (
    !event.pull_request ||
    !Number.isSafeInteger(event.number) ||
    event.number < 1
  ) {
    throw new Error('Expected a pull request event with a valid PR number.');
  }

  const { base, head, title } = event.pull_request;

  if (!base?.sha || !head?.sha || typeof title !== 'string') {
    throw new Error('Pull request base SHA, head SHA, and title are required.');
  }

  const errors = [];
  const squashTitleError = validateSubject(`${title} (#${event.number})`);

  if (squashTitleError) {
    errors.push(`PR title (including the squash suffix): ${squashTitleError}`);
  }

  const revisions = execFileSync(
    'git',
    ['rev-list', `${base.sha}..${head.sha}`],
    {
      encoding: 'utf8',
    },
  ).trim();

  if (!revisions) {
    throw new Error('No commits found between the pull request base and head.');
  }

  for (const sha of revisions.split('\n')) {
    const subject = execFileSync('git', ['show', '-s', '--format=%s', sha], {
      encoding: 'utf8',
    }).trimEnd();
    const error = validateSubject(subject);

    if (error) {
      errors.push(`${sha.slice(0, 12)}: ${error}`);
    }
  }

  return errors;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    if (!process.env.GITHUB_EVENT_PATH) {
      throw new Error('GITHUB_EVENT_PATH is required.');
    }

    const event = JSON.parse(
      readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'),
    );
    const errors = validatePullRequest(event);

    if (errors.length) {
      for (const error of errors) {
        console.error(`::error::${error}`);
      }

      process.exitCode = 1;
    } else {
      console.log(
        'PR title and commit subjects match the documented convention.',
      );
    }
  } catch (error) {
    console.error(
      `::error::Commit validation failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  }
}
