'use strict';

const branchPattern = /^refs\/heads\/rent-\d{5}$/u;

function validatePushDestination(remoteRef) {
  if (!branchPattern.test(remoteRef)) {
    throw new Error(
      'Push only the current rent-xxxxx feature branch to a rent-xxxxx branch.',
    );
  }
}

function validatePushRef(localRef, remoteRef, current) {
  validatePushDestination(remoteRef);
  if (!branchPattern.test(localRef) || localRef !== current) {
    throw new Error(
      'Push only the current rent-xxxxx feature branch to a rent-xxxxx branch.',
    );
  }
}

module.exports = { validatePushDestination, validatePushRef };
