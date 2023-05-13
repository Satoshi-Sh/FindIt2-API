import express, { Request, Response } from "express";
const postgres = require("postgres");
require("dotenv").config();

const app = express();
const port = 3000;

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
const URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}`;

const sql = postgres(URL, { ssl: "require" });

app.get("/actor/:name", async (req: Request, res: Response) => {
  const name: string = req.params.name;
  try {
    const reviews =
      await sql`SELECT movies.title, ratings.rating, ratings.votes, movies.year  
    FROM people 
    JOIN stars ON people.id = stars.person_id 
    JOIN movies ON stars.movie_id = movies.id 
    JOIN ratings ON movies.id = ratings.movie_id 
    WHERE people.name ILIKE ${name}
    ORDER BY movies.year ASC, movies.title ASC;`;
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/director/:name", async (req: Request, res: Response) => {
  const name: string = req.params.name;
  console.log(name);
  try {
    const reviews =
      await sql`SELECT movies.title, ratings.rating, ratings.votes, movies.year  
    FROM people 
    JOIN directors ON people.id = directors.person_id 
    JOIN movies ON directors.movie_id = movies.id 
    JOIN ratings ON movies.id = ratings.movie_id 
    WHERE people.name ILIKE ${name}
    ORDER BY movies.year ASC, movies.title ASC;`;
    console.log(reviews);
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
