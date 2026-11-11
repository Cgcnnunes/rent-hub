'use strict';

module.exports = {
  defaultIgnores: false,
  parserPreset: {
    parserOpts: {
      headerPattern: /^([a-z]+)\((rent-[0-9]{5})\): (.+)$/u,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  plugins: [
    {
      rules: {
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
    'description-length': [2, 'always'],
    'description-lowercase': [2, 'always'],
    'description-not-blank': [2, 'always'],
    'scope-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'type-enum': [2, 'always', ['feat', 'chore', 'refactor', 'fix', 'doc']],
  },
};
