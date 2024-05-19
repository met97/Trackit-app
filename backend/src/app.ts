// import
import express, { Express } from "express";
import historyApiFallback from "connect-history-api-fallback";
import showsRouter from "./routers/shows-router";
import directorRouter from "./routers/director-router";
import genreRouter from "./routers/genre-router";
import userRouter from "./routers/user-router";
import adminRouter from "./routers/admin-router";

// istanzio express
const app: Express = express();
const port: number = 3000;

app.use(historyApiFallback());

app.use(express.static("public"));
app.use(express.static("dist-fe"));

app.use(express.json());
app.use(showsRouter);
app.use(directorRouter);
app.use(genreRouter);
app.use(userRouter);
app.use(adminRouter);

app.use(function (req, res, next) {
	res.setHeader("Content-Type", "text/plain");
	res.status(404).send("Ops... Pagina non trovata");
});

app.listen(port, function () {
	console.log("sto ascoltando sulla porta " + port);
});
