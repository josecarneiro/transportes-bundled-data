'use strict';

const { join } = require('path');

const buildCarris = require('./carris');

buildCarris(join(__dirname, '..', 'dist', 'carris'), { pretty: true });
