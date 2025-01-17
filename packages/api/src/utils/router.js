import { parse } from 'regexparam'
import { database } from '../constants.js'

/**
 * @typedef {{ params: Record<string, string> }} BasicRouteContext
 * @typedef {(req: Request) => boolean | Record<string,string>} Condition
 * @typedef {(req: Request) => Response} BasicHandler
 * @typedef {(req: Request, rsp: Response) => Response} ResponseHandler
 */

/**
 * @template {BasicRouteContext} C
 * @typedef {(event: FetchEvent, ctx: C) => Promise<Response> | Response} Handler
 */

/**
 * @template {BasicRouteContext} C
 * @typedef {(req: Request, err: Error, ctx: C) => Response} ErrorHandler
 */

/**
 * Match route params
 *
 * @param {string} path
 * @param {{ keys: string[]; pattern: RegExp;}} result
 */
function matchParams(path, result) {
  let i = 0
  /** @type {Record<string, string>} */
  const out = {}
  const { keys, pattern } = result
  let matches = pattern.exec(path)
  if (!matches) {
    return out
  }
  while (i < keys.length) {
    out[keys[i]] = matches[++i]
  }
  return out
}

/**
 * The Router handles determines which handler is matched given the
 * conditions present for each request.
 *
 * @template {BasicRouteContext} C
 */
class Router {
  /**
   * @param {(e: FetchEvent, params: Record<string, string>) => C} getRouteContext
   * @param {object} [options]
   * @param {BasicHandler} [options.onNotFound]
   * @param {ErrorHandler<C>} [options.onError]
   */
  constructor(getRouteContext, options) {
    /**
     * @private
     */
    this.getRouteContext = getRouteContext

    const defaults = {
      onNotFound() {
        return new Response(null, {
          status: 404,
          statusText: 'Not Found',
        })
      },
      onError() {
        return new Response(null, {
          status: 500,
          statusText: 'Internal Server Error',
        })
      },
    }
    this.options = {
      ...defaults,
      ...options,
    }
    /** @type {{ conditions: Condition[]; handler: Handler<C>; postHandlers: ResponseHandler[] }[]} */
    this.routes = []
  }

  /**
   * Add route
   *
   * @example Route example
   * ```text
   * Static (/foo, /foo/bar)
   * Parameter (/:title, /books/:title, /books/:genre/:title)
   * Parameter w/ Suffix (/movies/:title.mp4, /movies/:title.(mp4|mov))
   * Optional Parameters (/:title?, /books/:title?, /books/:genre/:title?)
   * Wildcards (*, /books/*, /books/:genre/*)
   * ```
   * @see https://github.com/lukeed/regexparam
   *
   *
   * @param {string} method
   * @param {string} route
   * @param {Handler<C>} handler
   * @param {Array<ResponseHandler> } [postHandlers]
   */
  add(method, route, handler, postHandlers = []) {
    const methodCondition = (/** @type {Request} */ req) => {
      const m = method.trim().toLowerCase()
      if (m === 'all') {
        return true
      }
      return req.method.toLowerCase() === m
    }

    const parsed = parse(route)
    const routeCondition = (/** @type {Request} */ req) => {
      const url = new URL(req.url)
      const path = url.pathname

      const match = parsed.pattern.test(path)
      if (match) {
        return matchParams(path, parsed)
      }
      return false
    }

    this.routes.push({
      conditions: [methodCondition, routeCondition],
      handler,
      postHandlers,
    })
  }

  /**
   * Resolve returns the matching route for a request that returns
   * true for all conditions (if any).
   *
   * @param {Request} req
   * @return {[Handler<C>|false, Record<string,string>, ResponseHandler[]]}
   */
  resolve(req) {
    for (let i = 0; i < this.routes.length; i++) {
      const { conditions, handler, postHandlers } = this.routes[i]
      const method = conditions[0](req)
      const routeParams = conditions[1](req)
      if (method && typeof routeParams !== 'boolean') {
        return [handler, routeParams, postHandlers]
      }
    }

    return [false, {}, []]
  }

  /**
   * @param {FetchEvent} event
   */
  async route(event) {
    const req = event.request
    const [handler, params, postHandlers] = this.resolve(req)
    const ctx = this.getRouteContext(event, params)
    let rsp

    if (handler) {
      try {
        rsp = await handler(event, ctx)
      } catch (err) {
        // @ts-ignore
        rsp = this.options.onError(req, err, ctx)
      }
    } else {
      rsp = this.options.onNotFound(req)
    }

    return postHandlers.reduce((r, handler) => handler(req, r), rsp)
  }

  /**
   * Listen to fetch event
   *
   * @param {FetchEvent} event
   */
  listen(event) {
    const url = new URL(event.request.url)
    // Add more if needed for other backends
    const passThrough = [database.url]

    // Ignore http requests from the passthrough list above
    if (!passThrough.includes(`${url.protocol}//${url.host}`)) {
      event.respondWith(this.route(event))
    }
  }
}

export { Router }
