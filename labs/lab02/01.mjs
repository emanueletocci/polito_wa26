/*
 * Web Applications
 * Lab 1 - Exercise 2
 */

import dayjs from "dayjs";
import sqlite from "sqlite3";

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
	// Additional instruction to enable debug
	debugger;
}

main();
