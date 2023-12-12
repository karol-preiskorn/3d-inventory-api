"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignup = exports.logout = exports.postLogin = exports.getLogin = void 0;
const passport_1 = __importDefault(require("passport"));
const express_validator_1 = require("express-validator");
/**
 * Login page.
 * @route GET /login
 */
const getLogin = (req, res) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/login", {
        title: "Login",
    });
};
exports.getLogin = getLogin;
/**
 * Sign in using email and password.
 * @route POST /login
 */
const postLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, express_validator_1.check)("email", "Email is not valid").isEmail().run(req);
    yield (0, express_validator_1.check)("password", "Password cannot be blank").isLength({ min: 1 }).run(req);
    yield (0, express_validator_1.body)("email").normalizeEmail({ gmail_remove_dots: false }).run(req);
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.redirect("/login");
    }
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            // req.flash("errors", {msg: info.message});
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // req.flash().success
            res.redirect("/");
        });
    })(req, res, next);
});
exports.postLogin = postLogin;
/**
 * Log out.
 * @route GET /logout
 */
const logout = (req, res) => {
    // req.logout('1')
    res.redirect("/");
};
exports.logout = logout;
/**
 * Signup page.
 * @route GET /signup
 */
const getSignup = (req, res) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/signup", {
        title: "Create Account"
    });
};
exports.getSignup = getSignup;
