'use strict';

const dotenv = require('dotenv');
dotenv.config();

const { join } = require('path');

const buildCarris = require('./carris');
const buildMetro = require('./metro');

const distPath = join(__dirname, '..', 'dist');

buildCarris(join(distPath, 'carris'), { pretty: true });
buildMetro(join(distPath, 'metro'), { pretty: true });
