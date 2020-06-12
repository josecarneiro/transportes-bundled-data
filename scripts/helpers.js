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

exports.ensureDirectoryExists = ensureDirectoryExists;
