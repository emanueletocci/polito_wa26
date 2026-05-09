/*
 * Web Applications
 * Lab 3 - ExpressJS and REST APIs
 */

import express from "express";
import morgan from "morgan";
import filmDao from "./dao.mjs";
import { check, validationResult } from "express-validator";

const app = express();

// set-up the middlewares
app.use(morgan("dev"));
app.use(express.json()); // To automatically decode incoming json

app.get("/", (req, res) => {
	res.send("Hello!");
});

/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
	return `${location}[${param}]: ${msg}`;
};

/***  APIs ***/

// GET /api/films/:id
app.get("/api/films/:id", [check("id").isInt({ min: 1 })], async (req, res) => {
	// - req: request object, contains all the information about the incoming request (e.g., URL, parameters, body, etc.)
	// - res: response object, used to send back the response to the client (e.g., status code, headers, body, etc.)

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		// if id < 0 launch 422 error
		return res.status(422).json({ errors: errors.array() });
	}

	try {
		// Retrive the id from the url
		const id = req.params.id;
		const film = await filmDao.getFilm(id);

		if (film.error) {
			return res.status(404).json({ error: `No film found with id ${id}` });
		}

		// If the film is found, send it back as JSON response
		// Status code 200 is implicit when using res.json, but we can set it explicitly if we want
		res.json(film);
	} catch (err) {
		res.status(500).json({ error: `Internal Server Error: ${errorMessage}` });
	}
});

/*
app.get('/api/films/:id',
  [ check('id').isInt({min: 1}) ],    // check: is the id an integer, and is it a positive integer?
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }
    try {
      const result = await filmDao.getFilm(req.params.id);
      if (result.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        res.status(404).json(result);
      else
        res.json(result);
    } catch (err) {
      res.status(500).end();
    }
  }
);
*/

// GET /api/films
app.get("/api/films", async (req, res) => {
	try {
		const filter = req.query.filter;
		const filmList = await filmDao.listFilms(filter);

		res.json(filmList);
	} catch (err) {
		if (err.error === "The specified filter is not available") {
			return res.status(400).json(err);
		}
		const errorMessage = err.message ? err.message : err;
		res.status(500).json({ error: `Internal Server Error: ${errorMessage}` });
	}
});

/*
app.get('/api/films', 
  (req, res) => {
    filmDao.listFilms(req.query.filter)
      .then(films => res.json(films))
      .catch((err) => res.status(500).json(err)); // always return a json and an error message
  }
);
*/

// POST /api/films
app.post(
	"/api/films",
	[
		check("favorite").isBoolean(),
		check("watchDate")
			.isLength({ min: 10, max: 10 })
			.isISO8601({ strict: true })
			.optional({ checkFalsy: true }),
		check("rating").isInt({ min: 1, max: 5 }),
	],
	async (req, res) => {
		// check validation errors
		const errors = validationResult(req).formatWith(errorFormatter);

		if (!errors.isEmpty()) {
			return res.status(422).json(errors.errors);
		}

		const film = {
			title: req.body.title,
			favorite: req.body.favorite,
			watchDate: req.body.watchDate,
			rating: req.body.rating,
		};

		try {
			const result = await filmDao.createFilm(film);
			res.json(result);
		} catch {
			res.status(500).json({
				error: `Database error during the creation of new film: ${err}`,
			});
		}
	},
);

// PUT /api/films/:id
app.put("/api/films/:id", [check("id").isInt({ min: 1 })], async (req, res) => {
	const errors = validationResult(req).formatWith(errorFormatter);
	// checking validation errors
	if (!errors.isEmpty()) {
		// NOTA: Assicurati di usare .array() o la proprietà corretta dell'errore, spesso è errors.array()
		return res.status(422).json(errors.error);
	}

	// retrieve the id from the URL and cast it to a number
	const filmId = Number(req.params.id);

	// check if the body.id is equal to the id passed through the url
	if (req.body.id && req.body.id !== filmId) {
		return res.status(422).json({ error: "URL and body id mismatch" });
	}

	try {
		const film = await filmDao.getFilm(filmId);
		if (film.error) return res.status(404).json(film);

		const newFilm = {
			title: req.body.title || film.title,
			favorite: req.body.favorite || film.favorite,
			watchDate: req.body.watchDate || film.watchDate,
			rating: req.body.rating || film.rating,
		};

		const result = await filmDao.updateFilm(film.id, newFilm);

		if (result.error) res.status(404).json(result);
		else res.json(result);
	} catch (err) {
		res.status(500).json({
			error: `Database error during the update of film ${req.params.id}`,
		});
	}
});

// Additional instruction to enable debug
debugger;

// Starting express server on 3001 port
app.listen(3001, () => {
	console.log("Hello! Server ready!");
});
