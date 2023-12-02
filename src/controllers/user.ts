import async from "async"
import crypto from "crypto"
import nodemailer from "nodemailer"
import passport from "passport"
import { user } from "../models/3d-inventory"
import { Request, Response, NextFunction } from "express"
import { IVerifyOptions } from "passport-local"
import { WriteError } from "mongodb"
import { body, check, validationResult } from "express-validator"

/**
 * Login page.
 * @route GET /login
 */
export const getLogin = (req: Request, res: Response): void => {
  if (req.user) {
    return res.redirect("/")
  }
  res.render("account/login", {
    title: "Login",
  })
}

/**
 * Sign in using email and password.
 * @route POST /login
 */
export const postLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await check("email", "Email is not valid").isEmail().run(req)
  await check("password", "Password cannot be blank").isLength({ min: 1 }).run(req)
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req)

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.redirect("/login")
  }

  passport.authenticate("local", (err: Error, user: user, info: IVerifyOptions) => {
    if (err) { return next(err) }
    if (!user) {
      // req.flash("errors", {msg: info.message});
      return res.redirect("/login")
    }
    req.logIn(user, (err) => {
      if (err) { return next(err) }
      //req.flash().success
      res.redirect("/")
    })
  })(req, res, next)
}

/**
 * Log out.
 * @route GET /logout
 */
export const logout = (req: Request, res: Response): void => {
  // req.logout('1')
  res.redirect("/")
}

/**
 * Signup page.
 * @route GET /signup
 */
export const getSignup = (req: Request, res: Response): void => {
  if (req.user) {
    return res.redirect("/")
  }
  res.render("account/signup", {
    title: "Create Account"
  })
}

