"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
exports.connection = mysql2_1.default.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "Trackit-test2",
    port: 3310,
});
//funzionalità mysql2 per usare placeholder nominativi anziché "?"
exports.connection.config.namedPlaceholders = true;
