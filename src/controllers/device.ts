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
import { ObjectId } from "mongodb"
import * as db from "../services/database.service"
import { device } from "../models/3d-inventory"

/**
 * Contact form page.
 * @route GET /devices
 */
export const getDevices = (req: Request, res: Response) => {
  db.runQuery("devices", {})
}

/**
 * Send a contact form via Nodemailer.
 * @route POST /contact
 */
export const postContact = async (req: Request, res: Response) => {
  await check("name", "Name cannot be blank").not().isEmpty().run(req)
  await check("email", "Email is not valid").isEmail().run(req)
  await check("message", "Message cannot be blank").not().isEmpty().run(req)

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    req.flash().errors
    return res.redirect("/contact")
  }

}
