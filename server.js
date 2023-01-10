const http = require("http");
const fs = require("fs/promises");

const app = http.createServer((request, response) => {
  const { method, url } = request;

  if (url === "/api") {
    if (method === "GET") {
      response.setHeader("Content-Type", "application/JSON");
      response.statusCode = 200;
      response.end(JSON.stringify({ message: "Hello!" }));
    }
  }

  let fictionBoolean;

  if (url === `/api/books?fiction=${true}`) {
    if (method === "GET") {
      fs.readFile("./data/books.json", "utf-8").then((books) => {
        response.setHeader("Content-Type", "application/JSON");
        response.statusCode = 200;
        const parsedBooks = JSON.parse(books);

        if (url.endsWith("true")) {
          const fictionBooks = parsedBooks.map((book) => {
            if (book.isFiction === true) {
              return book;
            }
          });

          response.end(JSON.stringify({ books: fictionBooks }));
        }
      });
    }

    if (method === "POST") {
      let body = "";

      request.on("data", (packet) => {
        body += packet.toString();
      });

      request.on("end", () => {
        fs.readFile("./data/books.json", "utf-8").then((books) => {
          const parsedBooks = JSON.parse(books);
          const parsedBody = JSON.parse(body);
          const allBookIds = parsedBooks.map((book) => {
            return book.bookId;
          });
          const updatedBooks = [...parsedBooks, parsedBody];

          if (!allBookIds.includes(parsedBody.bookId)) {
            return fs
              .writeFile("./data/books.json", JSON.stringify(updatedBooks))
              .then(() => {
                response.setHeader("Content-Type", "application/JSON");
                response.statusCode = 200;
                response.end(JSON.stringify(parsedBody));
              });
          } else {
            response.end(console.log("ID already exists, post new book"));
          }
        });
      });
    }
  }

  let singleBookId =
    url.length === 12
      ? url[url.length - 1]
      : url[url.length - 2] + url[url.length - 1];

  if (url === `/api/books/${singleBookId}`) {
    if (method === "GET") {
      fs.readFile("./data/books.json", "utf-8").then((books) => {
        response.setHeader("Content-Type", "application/JSON");
        const parsedBooks = JSON.parse(books);
        let singleBook;
        const allBookIds = parsedBooks.map((book) => {
          return book.bookId;
        });

        if (allBookIds.includes(parseInt(singleBookId))) {
          for (let i = 0; i < parsedBooks.length; i++) {
            if (parsedBooks[i].bookId === parseInt(singleBookId)) {
              singleBook = parsedBooks[i];
            }
          }
          response.statusCode = 200;
          response.end(JSON.stringify({ book: singleBook }));
        } else {
          response.statusCode = 404;
          response.end(JSON.stringify("ID does not exist"));
        }
      });
    }
  }

  let regexId = url.match(/([\d])/g).join("");

  if (url === `/api/books/${regexId}/author`) {
    if (method === "GET") {
      fs.readFile("./data/books.json", "utf-8").then((books) => {
        const parsedBooks = JSON.parse(books);
        let singleBook;

        const allBookIds = parsedBooks.map((book) => {
          return book.bookId;
        });

        if (allBookIds.includes(parseInt(regexId))) {
          for (let i = 0; i < parsedBooks.length; i++) {
            if (parsedBooks[i].bookId === parseInt(regexId)) {
              singleBook = parsedBooks[i];
            }
          }

          fs.readFile("./data/authors.json", "utf-8").then((authors) => {
            const parsedAuthors = JSON.parse(authors);
            let authorObject;
            for (let i = 0; i < parsedAuthors.length; i++) {
              if (parsedAuthors[i].authorId === singleBook.authorId) {
                authorObject = parsedAuthors[i];
              }
            }
            response.setHeader("Content-Type", "application/JSON");
            response.statusCode = 200;
            response.end(JSON.stringify({ author: authorObject }));
          });
        } else {
          response.setHeader("Content-Type", "application/JSON");
          response.statusCode = 404;
          response.end(JSON.stringify("Book Id does not exist"));
        }
      });
    }
  }

  if (url === "/api/authors") {
    if (method === "GET") {
      fs.readFile("./data/authors.json", "utf-8").then((authors) => {
        response.setHeader("Content-Type", "application/JSON");
        response.statusCode = 200;
        const parsedAuthors = JSON.parse(authors);
        response.end(JSON.stringify({ authors: parsedAuthors }));
      });
    }
  }
});

app.listen(9090, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Listening on 9090");
  }
});
