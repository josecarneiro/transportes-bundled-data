'use strict';

const { join } = require('path');
const Gira = require('transportes/gira');

const { log, write } = require('transportes/utilities');

const { ensureDirectoryExists } = require('./helpers');

module.exports = async (path, { pretty = false } = {}) => {
  await ensureDirectoryExists(path);
  const client = new Gira({ key: process.env.API_EMEL_KEY });

  const loadStations = async () => {
    const stationsBasePath = join(path, 'stations');
    await ensureDirectoryExists(stationsBasePath);
    // List all stations
    const stations = await client.listStations();
    const stationData = stations.map(
      ({ bikes, docks, ratio, status, ...station }) => station
    );
    write(join(stationsBasePath, 'list.json'), stationData, { pretty });
    // log(stationData);
    // // Save each stop
    // // const visibleStops = stops;
    // const visibleStops = stops.filter(({ visible }) => visible);
    // for (const stop of visibleStops) {
    //   write(join(stopsBasePath, `${stop.publicId}.json`), stop, { pretty });
    // }
  };

  await loadStations();
};
