import type { books, editions } from "../../clients/hardcover/hardcover-graphql";
import type { Book } from "./schemas";


export const formatBook = (edition: editions, bookDetails: books): Book => {
    const { book_id, isbn_10, isbn_13 } = edition;
    const { cached_contributors, cached_image, cached_tags, headline, slug, title, rating } = bookDetails;

    const authorNames = cached_contributors.reduce((acc: any[], { author }: any) => {

        const authorName = author.name as string;

        if (acc.includes(authorName)) {
            return acc;
        } else {
            acc.push(authorName);
        }
        
        return acc;
    }, [] as string[]);
}
