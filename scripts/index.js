'use strict';

const dotenv = require('dotenv');
dotenv.config();

const { join } = require('path');
const { ensureDirectoryExists } = require('./helpers');

const buildCarris = require('./carris');
const buildMetro = require('./metro');
const buildGira = require('./gira');

const distPath = join(__dirname, '..', 'dist');

const options = {
  pretty: true
};

const buildAll = async () => {
  await ensureDirectoryExists(distPath);
  Promise.all([
    buildCarris(join(distPath, 'carris'), options),
    buildMetro(join(distPath, 'metro'), options),
    buildGira(join(distPath, 'gira'), options)
  ]);
};

buildAll();
