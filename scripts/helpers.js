'use strict';

const fs = require('fs').promises;

const ensureDirectoryExists = async path => {
  const directory = path;
  try {
    await fs.stat(directory);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path, { recursive: true });
    } else {
      throw error;
    }
  }
};

const isNumerical = value => Number(value).toString() === value;

const sortIds = (a, b) => {
  if (isNumerical(a) && isNumerical(b)) {
    return Number(a) - Number(b);
  } else if (isNumerical(a)) {
    return -1;
  } else if (isNumerical(b)) {
    return 1;
  } else if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  } else {
    return a > b;
  }
};

exports.ensureDirectoryExists = ensureDirectoryExists;
exports.sortIds = sortIds;
