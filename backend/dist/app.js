"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import
const express_1 = __importDefault(require("express"));
const connect_history_api_fallback_1 = __importDefault(require("connect-history-api-fallback"));
const shows_router_1 = __importDefault(require("./routers/shows-router"));
const director_router_1 = __importDefault(require("./routers/director-router"));
const genre_router_1 = __importDefault(require("./routers/genre-router"));
const user_router_1 = __importDefault(require("./routers/user-router"));
const admin_router_1 = __importDefault(require("./routers/admin-router"));
// istanzio express
const app = (0, express_1.default)();
const port = 3000;
app.use((0, connect_history_api_fallback_1.default)());
app.use(express_1.default.static("public"));
app.use(express_1.default.static("dist-fe"));
app.use(express_1.default.json());
app.use(shows_router_1.default);
app.use(director_router_1.default);
app.use(genre_router_1.default);
app.use(user_router_1.default);
app.use(admin_router_1.default);
app.use(function (req, res, next) {
    res.setHeader("Content-Type", "text/plain");
    res.status(404).send("Ops... Pagina non trovata");
});
app.listen(port, function () {
    console.log("sto ascoltando sulla porta " + port);
});
