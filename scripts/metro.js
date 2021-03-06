'use strict';

const { join } = require('path');
const { log, write } = require('transportes/utilities');
const { ensureDirectoryExists } = require('./helpers');

const Metro = require('transportes/metro');

module.exports = async (path, { pretty = false } = {}) => {
  await ensureDirectoryExists(path);
  const metro = new Metro({
    key: process.env.API_METRO_KEY
  });

  const loadStations = async () => {
    const rawStations = await metro.listStations();

    const rawDestinations = await metro.listDestinations();
    const destinations = rawDestinations.map(destination => ({
      ...destination,
      station: rawStations.find(({ name }) => name === destination.name).id
    }));

    write(join(path, 'destinations.json'), destinations, {
      pretty
    });

    const rawEstimates = await metro.listEstimates();
    const platforms = rawEstimates.map(
      ({ platform: id, station, destination: destinationId }) => {
        const destination = destinations.find(({ id }) => id === destinationId);
        return { id, station, destination: destination.station };
      }
    );

    const stations = rawStations.map(station => ({
      ...station,
      platforms: platforms
        .filter(platform => platform.station === station.id)
        .map(({ id, destination }) => ({ id, destination }))
    }));
    write(join(path, 'stations.json'), stations, { pretty });
  };

  await loadStations();
};
