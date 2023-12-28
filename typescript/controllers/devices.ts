/*
 * File:        /src/controllers/contact copy.ts
 * Description: Controler for devices API
 * Used by:
 * Dependency:
 *
 * Date        By       Comments
 * ----------  -------  ------------------------------
 * 2023-11-21  C2RLO    Initial
 */

import { Request, Response } from "express"
import { check, validationResult } from "express-validator"
import { runQuery } from "../services/mongoService"
import type { device } from "../models/3d-inventory"
import { deviceSchema } from "../models/3d-inventory"

/**
 * Contact form page.
 * @route GET /devices
 */
export const getDevices = (req: Request, res: Response) => {
  runQuery("api/devices", {})
}

/**
 * Create Device
 * @route POST /api/deivce
 */
export const postDevice = async (req: Request, res: Response) => {
  await check("_id", "Name cannot be blank ans should be UUID").not().isEmpty().run(req)
  await check("name", "Email is not valid").not().isEmpty().run(req)
  await check("modelId", "Message cannot be blank").not().isEmpty().run(req)

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.redirect("/api/devices")
  }

}
