/*
 * Web Applications
 * Lab 3 - ExpressJS and REST APIs
 */

import express from "express";
import morgan from "morgan";
import { Film, FilmLibrary } from "./dao.mjs";

const app = express();
const library = new FilmLibrary();

// set-up the middlewares
app.use(morgan("dev"));
app.use(express.json()); // To automatically decode incoming json

app.get("/", (req, res) => {
	res.send("Hello!");
});

// APIs

// GET /api/films/:id
app.get("/api/films/:id", async (req, res) => {
    // - req: request object, contains all the information about the incoming request (e.g., URL, parameters, body, etc.)
    // - res: response object, used to send back the response to the client (e.g., status code, headers, body, etc.)
	try {
		// Retrive the id from the url
		const id = req.params.id;

		const film = await library.getFilm(id);

		if (film.error) {
			return res.status(404).json({ error: `No film found with id ${id}` });
		}

		// If the film is found, send it back as JSON response
        // Status code 200 is implicit when using res.json, but we can set it explicitly if we want
		res.json(film);
	} catch (err) {
		// 5. Gestione degli errori del server o del database
		res.status(500).json({ error: `Errore del server: ${err.message}` });
	}
});

// Additional instruction to enable debug
debugger;

// Starting express server on 3001 port
app.listen(3001, () => {
	console.log("Hello! Server ready!");
});
