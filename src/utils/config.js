"use strict";
/**
 * @file config.ts
 * @description load environment variables and sanitize them
 */
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var path_1 = require("path");
// Parsing the env file.
dotenv_1.default.config({ path: path_1.default.resolve('./.env') });
// Loading process.env as ENV interface if not set use environment variables
var getConfig = function () {
    return {
        ATLAS_URI: process.env.ATLAS_URI,
        DBNAME: process.env.DBNAME ? String(process.env.DBNAME) : '3d-inventory',
        API_YAML_FILE: process.env.API_YAML_FILE ? String(process.env.API_YAML_FILE) : 'src/api/openapi.yaml',
        HOST: process.env.HOST ? String(process.env.HOST) : 'localhost',
        PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
        COOKIE_EXPIRESIN: process.env.COOKIE_EXPIRESIN ? Number(process.env.COOKIE_EXPIRESIN) : 3600
    };
};
// Throwing an Error if any field was undefined we don't want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return it as Config which just removes the undefined from
// our type definition.
var getSanitizedConfig = function (config) {
    for (var _i = 0, _a = Object.entries(config); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (value === undefined) {
            throw new Error("Missing key ".concat(key, " in environment variables from .env"));
        }
    }
    return config;
};
var configRaw = getConfig();
var config = getSanitizedConfig(configRaw);
exports.default = config;
