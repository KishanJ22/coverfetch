import db from "../../db/db";

export const bookByHardcoverIdQuery = (id: number) =>
	db
		.selectFrom("coverfetch.books")
		.where("coverfetch.books.hardcoverId", "=", id.toString())
		.selectAll();
