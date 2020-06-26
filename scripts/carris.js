'use strict';

const { join } = require('path');
const Carris = require('transportes/carris');

const { log, write } = require('transportes/utilities');

const { ensureDirectoryExists, sortIds } = require('./helpers');

const cloneObject = object => JSON.parse(JSON.stringify(object));

const extractRoutePerStop = routeData => {
  const routes = routeData.map(({ id, variants }) => {
    const stops = variants
      .map(({ iteneraries }) =>
        iteneraries.map(({ connections }) =>
          connections.map(({ stop: { id: stop } }) => stop)
        )
      )
      .flat(Infinity)
      .filter((value, index, array) => array.indexOf(value) === index);
    return { id, stops };
  });
  const stops = routes.reduce((acc, { id: route, stops: stopIds }) => {
    const clone = cloneObject(acc);
    for (let stopId of stopIds) {
      if (clone[stopId]) {
        clone[stopId].push(route);
      } else {
        clone[stopId] = [route];
      }
    }
    return clone;
  }, {});
  return stops;
};

module.exports = async (path, { pretty = false } = {}) => {
  await ensureDirectoryExists(path);
  const carris = new Carris();

  const loadRoutes = async () => {
    const routesBasePath = join(path, 'routes');
    await ensureDirectoryExists(routesBasePath);
    // List all routes
    const rawRoutes = await carris.listRoutes();
    const routes = [...rawRoutes];
    routes.sort(({ id: a }, { id: b }) => sortIds(a, b));
    write(join(routesBasePath, 'list.json'), routes, { pretty });
    // Load each route
    const routeData = [];
    for (const { id } of routes.filter(({ visible }) => visible)) {
      const route = await carris.loadRoute(id);
      // if (route) routeData.push(route)
      if (route) {
        routeData.push(route);
        write(join(routesBasePath, `${id}.json`), route, { pretty });
      }
    }
    write(join(routesBasePath, `all.json`), routeData, { pretty });
    return routeData;
  };

  const loadStops = async routeData => {
    const stopsBasePath = join(path, 'stops');
    await ensureDirectoryExists(stopsBasePath);
    // List all stops
    const stops = await carris.listStops();
    stops.sort(({ id: a }, { id: b }) => sortIds(a, b));
    const routesPerStop = extractRoutePerStop(routeData);
    for (let stop of stops) stop.routes = routesPerStop[stop.id] || [];
    write(join(stopsBasePath, 'list.json'), stops, { pretty });
    // Save each stop
    // const visibleStops = stops;
    const visibleStops = stops
      // .filter(({ routes }) => routes.length)
      .filter(({ visible }) => visible);
    for (const stop of visibleStops) {
      write(join(stopsBasePath, `${stop.id}.json`), stop, { pretty });
    }
  };

  const routeData = await loadRoutes();
  await loadStops(routeData);
};
