'use strict';

const { join } = require('path');
const Carris = require('transportes/carris');

const { log, write } = require('transportes/utilities');

const { ensureDirectoryExists } = require('./helpers');

module.exports = async (path, { pretty = false } = {}) => {
  await ensureDirectoryExists(path);
  const carris = new Carris();

  const loadRoutes = async () => {
    const routesBasePath = join(path, 'routes');
    await ensureDirectoryExists(routesBasePath);
    // List all routes
    const routes = await carris.listRoutes();
    write(join(routesBasePath, 'list.json'), routes, { pretty });
    // Load each route
    const visibleRoutes = [...routes].filter(({ visible }) => visible);
    const routeData = [];
    for (const { number } of visibleRoutes.sort(() => 0.5 - Math.random())) {
      const route = await carris.loadRoute(number);
      if (route) {
        routeData.push(route);
        write(join(routesBasePath, `${number}.json`), route, { pretty });
      }
    }
    write(join(routesBasePath, `all.json`), routeData, { pretty });
  };

  const loadStops = async () => {
    const stopsBasePath = join(path, 'stops');
    await ensureDirectoryExists(stopsBasePath);
    // List all stops
    const stops = await carris.listStops();
    write(join(stopsBasePath, 'list.json'), stops, { pretty });
    // Save each stop
    // const visibleStops = stops;
    const visibleStops = stops.filter(({ visible }) => visible);
    for (const stop of visibleStops) {
      write(join(stopsBasePath, `${stop.publicId}.json`), stop, { pretty });
    }
  };

  await loadRoutes();
  await loadStops();
};
