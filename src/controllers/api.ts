import { Response, Request } from "express"

/**
 * List of API examples.
 * @route GET /api
 */
export const getApi = (_req: Request, res: Response) => {
  res.render("api/index", {
    title: "API Examples"
  })
}
