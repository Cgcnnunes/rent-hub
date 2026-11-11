'use strict';

const { validateSubject } = require('./scripts/validate-commit-messages.ts');

module.exports = {
  defaultIgnores: false,
  plugins: [
    {
      rules: {
        'rent-hub-subject': ({ raw }) => {
          const error = validateSubject(raw.split(/\r?\n/u, 1)[0]);
          return [!error, error || 'invalid commit subject'];
        },
      },
    },
  ],
  rules: { 'rent-hub-subject': [2, 'always'] },
};
