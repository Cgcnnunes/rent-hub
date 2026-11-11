import { execFileSync } from 'node:child_process';

import type { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';

const branch =
  process.env.COMMIT_BRANCH ??
  execFileSync('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
const expectedScope = /^rent-\d{5}$/u.test(branch)
  ? branch.toUpperCase()
  : null;

const config: UserConfig = {
  defaultIgnores: false,
  parserPreset: {
    parserOpts: {
      headerPattern: /^([a-z]+)\((RENT-[0-9]{5})\): (.+)$/u,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  plugins: [
    {
      rules: {
        'branch-scope': ({ scope }) => [
          Boolean(expectedScope && scope === expectedScope),
          expectedScope
            ? `scope must match the feature branch: ${expectedScope}`
            : 'feature branch must have the format rent-xxxxx',
        ],
        'description-lowercase': ({ subject }) => {
          if (!subject) return [true];
          return [
            subject === subject.toLowerCase(),
            'description must be lowercase',
          ];
        },
        'description-not-blank': ({ subject }) => [
          !subject || Boolean(subject.trim()),
          'description must not be blank',
        ],
        'description-length': ({ subject }) => {
          if (!subject) return [true];
          return [
            [...subject].length <= 120,
            'description must not exceed 120 characters',
          ];
        },
      },
    },
  ],
  rules: {
    'branch-scope': [RuleConfigSeverity.Error, 'always'],
    'description-length': [RuleConfigSeverity.Error, 'always'],
    'description-lowercase': [RuleConfigSeverity.Error, 'always'],
    'description-not-blank': [RuleConfigSeverity.Error, 'always'],
    'scope-empty': [RuleConfigSeverity.Error, 'never'],
    'subject-empty': [RuleConfigSeverity.Error, 'never'],
    'type-empty': [RuleConfigSeverity.Error, 'never'],
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      ['feat', 'chore', 'refactor', 'fix', 'doc'],
    ],
  },
};

export default config;
