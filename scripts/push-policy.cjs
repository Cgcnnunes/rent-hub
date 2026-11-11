'use strict';

function validatePushRef(localRef, remoteRef, current) {
  const branchPattern = /^refs\/heads\/rent-\d{5}$/u;
  if (
    !branchPattern.test(remoteRef) ||
    !branchPattern.test(localRef) ||
    localRef !== current
  ) {
    throw new Error(
      'Push only the current rent-xxxxx feature branch to a rent-xxxxx branch.',
    );
  }
}

module.exports = { validatePushRef };
