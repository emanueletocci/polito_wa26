import dayjs from "dayjs";
import sqlite from "sqlite3";

export function Film(id, title, isFavorite = false, watchDate, rating) {
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

export function FilmLibrary() {
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

	this.getFilm = (id) => {
		return new Promise((resolve, reject) => {
			const query = "SELECT * FROM films WHERE id = ?";

			// db.get is used to retrieve a single row from the database, since id is unique
			db.get(query, [id], (err, row) => {
				if (err) {
					reject(err);
				} else if (!row) {
					// If the row does not exist, resolve with an error message (or we could reject with an error, but in this case we want to handle it as a normal case, not as an exception)
					resolve({ error: "Film non trovato" });
				} else {
					// If the row exists, create and resolve with the single Film object
					const film = new Film(
						row.id,
						row.title,
						row.favorite == 1,
						row.watchdate,
						row.rating,
					);
					resolve(film);
				}
			});
		});
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
