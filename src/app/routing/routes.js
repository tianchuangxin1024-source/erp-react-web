import { modules } from '../../features/finance/model/modules.js'

export { modules }

export const routeFor = (module, page) => `${module.id}/${page.id}`

const routeMap = new Map(modules.flatMap((module) =>
  module.pages.map((page) => [routeFor(module, page), { module, page }]),
))

export const getRoute = (route) => routeMap.get(route)
