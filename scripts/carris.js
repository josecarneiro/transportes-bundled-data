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
    // List all routes
    const routes = await carris.listRoutes();
    const routeData = routes.filter(({ visible }) => !visible);
    // Load each route
    for (const { id } of routes.filter(({ visible }) => visible)) {
      const route = await carris.loadRoute(id);
      if (route) routeData.push(route);
      }
    // Sort routes by id
    routeData.sort(({ id: a }, { id: b }) => sortIds(a, b));
    write(join(path, `routes.json`), routeData, { pretty });
    return routeData;
  };

  const loadStops = async routeData => {
    // List all stops
    const stops = await carris.listStops();
    stops.sort(({ id: a }, { id: b }) => sortIds(a, b));
    const routesPerStop = extractRoutePerStop(routeData);
    for (let stop of stops) stop.routes = routesPerStop[stop.id] || [];
    write(join(path, 'stops.json'), stops, { pretty });
  };

  const routeData = await loadRoutes();
  await loadStops(routeData);
};
