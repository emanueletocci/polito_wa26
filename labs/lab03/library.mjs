/*
 * Web Applications
 * Lab 1 - Exercise 2
 */

import dayjs from "dayjs";
import sqlite from "sqlite3";
import express from 'express';
import morgan from 'morgan';

const app = express();

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());  // To automatically decode incoming json

app.get('/', (req, res) => {
    res.send('Hello!');
});

function Film(id, title, isFavorite = false, watchDate, rating) {
	this.id = id;
	this.title = title;
	this.favorite = isFavorite;
	this.rating = rating;
	// saved as dayjs object only if watchDate is truthy
	this.watchDate = watchDate && dayjs(watchDate);

	this.toString = () => {
		return (
			`Id: ${this.id}, ` +
			`Title: ${this.title}, Favorite: ${this.favorite}, ` +
			`Watch date: ${this.formatWatchDate("MMMM D, YYYY")}, ` +
			`Score: ${this.formatRating()}`
		);
	};

	this.formatWatchDate = (format) => {
		return this.watchDate ? this.watchDate.format(format) : "<not defined>";
	};

	this.formatRating = () => {
		return this.rating ? this.rating : "<not assigned>";
	};
}

function FilmLibrary() {
	// open the database connection
	const db = new sqlite.Database("films.db", (err) => {
		if (err) throw err;
	});

	this.closeDB = () => {
		try {
			db.close();
		} catch (error) {
			console.error(`Impossible to close the database! ${error}`);
		}
	};

	this.getAll = () => {
		return new Promise((resolve, reject) => {
			const query = "SELECT * FROM films";
			db.all(query, (err, rows) => {
				if (err) {
					reject(err);
				} else {
					// sqlite does not support booleans so we cast using r.favorite == 1, by comparison
					const films = rows.map(
						(r) =>
							// id, title, favorite, watchdate and rating are the columns of the films table
							new Film(r.id, r.title, r.favorite == 1, r.watchdate, r.rating),
					);
					resolve(films);
				}
			});
		});
	};

	this.getFavorites = () => {
		return new Promise((resolve, reject) => {
			const query = "SELECT * FROM films WHERE favorite = 1";
			db.all(query, (err, rows) => {
				if (err) {
					reject(err);
				} else {
					// sqlite does not support booleans so we cast using r.favorite == 1, by comparison
					const films = rows.map(
						(r) =>
							// id, title, favorite, watchdate and rating are the columns of the films table
							new Film(r.id, r.title, r.favorite == 1, r.watchdate, r.rating),
					);
					resolve(films);
				}
			});
		});
	};

	this.getWatchedToday = () => {
		return new Promise((resolve, reject) => {
			const query = "SELECT * FROM films WHERE watchdate = ?";
			const today = dayjs().format("YYYY-MM-DD");
			db.all(query, [today], (err, rows) => {
				if (err) {
					reject(err);
				} else {
					// sqlite does not support booleans so we cast using r.favorite == 1, by comparison
					const films = rows.map(
						(r) =>
							// id, title, favorite, watchdate and rating are the columns of the films table
							new Film(r.id, r.title, r.favorite == 1, r.watchdate, r.rating),
					);
					resolve(films);
				}
			});
		});
	};

	this.getBeforeThan = (date) => {
		return new Promise((resolve, reject) => {
			const query = "SELECT * FROM films WHERE watchdate < ?";
			db.all(query, [date.format("YYYY-MM-DD")], (err, rows) => {
				if (err) {
					reject(err);
				} else {
					// sqlite does not support booleans so we cast using r.favorite == 1, by comparison
					const films = rows.map(
						(r) =>
							// id, title, favorite, watchdate and rating are the columns of the films table
							new Film(r.id, r.title, r.favorite == 1, r.watchdate, r.rating),
					);
					resolve(films);
				}
			});
		});
	};

	this.getRateGreater = (rating) => {
		return new Promise((resolve, reject) => {
			const query = "SELECT * FROM films WHERE rating >= ?";
			db.all(query, [rating], (err, rows) => {
				if (err) {
					reject(err);
				} else {
					// sqlite does not support booleans so we cast using r.favorite == 1, by comparison
					const films = rows.map(
						(r) =>
							// id, title, favorite, watchdate and rating are the columns of the films table
							new Film(r.id, r.title, r.favorite == 1, r.watchdate, r.rating),
					);
					resolve(films);
				}
			});
		});
	};

	this.getWithWord = (string) => {
		return new Promise((resolve, reject) => {
			const query = "SELECT * FROM films WHERE title LIKE ?";
			db.all(query, [`%${string}%`], (err, rows) => {
				if (err) {
					reject(err);
				} else {
					// sqlite does not support booleans so we cast using r.favorite == 1, by comparison
					const films = rows.map(
						(r) =>
							// id, title, favorite, watchdate and rating are the columns of the films table
							new Film(r.id, r.title, r.favorite == 1, r.watchdate, r.rating),
					);
					resolve(films);
				}
			});
		});
	};

	this.addFilm = (film) => {
		return new Promise((resolve, reject) => {
			// film.id is ignored since the unique id can only come from the database
			const query =
				"INSERT INTO films(title, favorite, watchdate, rating) VALUES(?, ?, ?, ?)";
			const parameters = [
				film.title,
				film.favorite,
				film.watchDate.format("YYYY-MM-DD"),
				film.rating,
			];
			db.run(query, parameters, function (err) {
				// use function; this.lastID would not be available with an arrow function here
				if (err) reject(err);
				else resolve(this.lastID);
			});
		});
	};

	this.deleteFilm = (id) => {
		return new Promise((resolve, reject) => {
			const query = "DELETE FROM films WHERE id = ?";
			db.run(query, [id], function (err) {
				// use function; this.lastID would not be available with an arrow function here
				if (err) reject(err);
				// returning the number of affected rows: if nothing is updated, returns 0
				else resolve(this.changes);
			});
		});
	};

	this.deleteWatchDates = (id) => {
		return new Promise((resolve, reject) => {
			const query = "UPDATE films SET watchdate = NULL";
			db.run(query, [id], function (err) {
				// use function; this.lastID would not be available with an arrow function here
				if (err) reject(err);
				// returning the number of affected rows: if nothing is updated, returns 0
				else resolve(this.changes);
			});
		});
	};
}

async function main() {
	const library = new FilmLibrary();

	try {
		console.log("***Library***");
		const films = await library.getAll();

		films.forEach((el) => {
			console.log(el.toString());
		});

		console.log("\n***Favorite Library***");
		const favorite = await library.getFavorites();
		favorite.forEach((el) => {
			console.log(el.toString());
		});

		console.log("\n***Watched Today***");
		const watchedToday = await library.getWatchedToday();
		watchedToday.forEach((el) => {
			console.log(el.toString());
		});

		console.log("\n***Earlier Than***");
		const date = dayjs("2023-03-19");
		const earlierThan = await library.getBeforeThan(date);
		earlierThan.forEach((el) => {
			console.log(el.toString());
		});

		console.log("\n***Rating Filtering***");
		const rating = 4;
		const rateGreater = await library.getRateGreater(rating);
		rateGreater.forEach((el) => {
			console.log(el.toString());
		});

		console.log("\n***String Filtering***");
		const string = "war";
		const stringFiltering = await library.getWithWord(string);
		stringFiltering.forEach((el) => {
			console.log(el.toString());
		});
	} catch (err) {
		console.log(err);
	}

	// inserting a new film
	let newFilmId = -1;
	console.log(`\n****** Adding a new movie: ******`);
	const newFilm = new Film(
		newFilmId,
		"Fast & Furious",
		false,
		dayjs().toISOString(),
		2,
	);
	try {
		newFilmId = await library.addFilm(newFilm);
		console.log(`New film inserted! ID: ${newFilmId}.`);
	} catch (error) {
		console.error(`Impossible to insert a new movie! ${error}`);
	}

	// delete a film
	console.log(`\n****** Deleting the movie with ID '${newFilmId}': ******`);
	try {
		const deleted = await library.deleteFilm(newFilmId);
		if (deleted) console.log("Movie successfully deleted!");
		else console.error(`There is no movie to delete with id: ${newFilmId}`);
	} catch (error) {
		console.error(
			`Impossible to delete the movie with id: ${newFilmId}! ${error}`,
		);
	}
	// reset all the whatchdate
	console.log(`\n****** Resetting all the watch dates: ******`);
	try {
		const numAffected = await library.resetWatchDate();
		console.log(
			`Watch dates resetted! Number of affected records: ${numAffected}`,
		);
	} catch (error) {
		console.error(`Impossible to reset watch dates! ${error}`);
	}

	// printing updated movies
	console.log("\n****** All the movies after the updates: ******");
	const filmUpdated = await library.getAll();
	if (filmUpdated.length === 0) console.log("No movies yet, try later.");
	else filmUpdated.forEach((film) => console.log(`${film}`));

	library.closeDB();
}

// Additional instruction to enable debug
debugger;

// Starting express server on 3001 port
app.listen(3001, ()=>{console.log('Server ready');})
main();
