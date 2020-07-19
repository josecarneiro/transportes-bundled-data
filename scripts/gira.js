'use strict';

const { join } = require('path');
const Gira = require('transportes/gira');

const { log, write } = require('transportes/utilities');

const { ensureDirectoryExists } = require('./helpers');

module.exports = async (path, { pretty = false } = {}) => {
  await ensureDirectoryExists(path);
  const client = new Gira({ key: process.env.API_EMEL_KEY });

  const loadStations = async () => {
    // List all stations
    const stations = await client.listStations();
    stations.sort(({ id: a }, { id: b }) => a - b);
    const stationData = stations.map(
      ({ bikes, docks, ratio, status, updated, ...station }) => station
    );
    write(join(path, 'stations.json'), stationData, { pretty });
  };

  await loadStations();
};
