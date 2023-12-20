"use strict"
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value) }) }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)) } catch (e) { reject(e) } }
        function rejected(value) { try { step(generator.throw(value)) } catch (e) { reject(e) } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected) }
        step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
}
Object.defineProperty(exports, "__esModule", { value: true })
exports.postContact = exports.getDevices = void 0
const express_validator_1 = require("express-validator")
const mongoService_1 = require("./../services/mongoService")
/**
 * Contact form page.
 * @route GET /devices
 */
const getDevices = (req, res) => {
    (0, mongoService_1.runQuery)("devices", {})
}
exports.getDevices = getDevices
/**
 * Send a contact form via Nodemailer.
 * @route POST /contact
 */
const postContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, express_validator_1.check)("name", "Name cannot be blank").not().isEmpty().run(req)
    yield (0, express_validator_1.check)("email", "Email is not valid").isEmail().run(req)
    yield (0, express_validator_1.check)("message", "Message cannot be blank").not().isEmpty().run(req)
    const errors = (0, express_validator_1.validationResult)(req)
    if (!errors.isEmpty()) {
        return res.redirect("/api")
    }
})
exports.postContact = postContact
