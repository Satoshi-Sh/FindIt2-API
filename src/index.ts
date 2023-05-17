import express, { Request, Response } from "express";
const postgres = require("postgres");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3050;
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID, ORIGIN } =
  process.env;
const corsOptions = {
  origin: ORIGIN ? ORIGIN : "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

const URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}`;

const sql = postgres(URL, { ssl: "require" });

app.get("/actor/:name", async (req: Request, res: Response) => {
  const name: string = req.params.name;
  try {
    const reviews =
      await sql`SELECT movies.id,movies.title, ratings.rating, ratings.votes, movies.year  
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

// return candidates
app.get("/search/actor/:name", async (req: Request, res: Response) => {
  const name: string = req.params.name;
  try {
    const names = await sql`SELECT DISTINCT people.name  
    FROM people 
    JOIN stars ON people.id = stars.person_id  
    WHERE people.name ILIKE '%' || ${name} || '%'
    ORDER BY people.name ASC
    LIMIT 20;`;
    res.json(names);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/director/:name", async (req: Request, res: Response) => {
  const name: string = req.params.name;
  try {
    const reviews =
      await sql`SELECT movies.id,movies.title, ratings.rating, ratings.votes, movies.year  
    FROM people 
    JOIN directors ON people.id = directors.person_id 
    JOIN movies ON directors.movie_id = movies.id 
    JOIN ratings ON movies.id = ratings.movie_id 
    WHERE people.name ILIKE ${name}
    ORDER BY movies.year ASC, movies.title ASC;`;
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// return director candidates
app.get("/search/director/:name", async (req: Request, res: Response) => {
  const name: string = req.params.name;
  try {
    const names = await sql`SELECT DISTINCT people.name  
    FROM people 
    JOIN directors ON people.id = directors.person_id  
    WHERE people.name ILIKE '%' || ${name} || '%'
    ORDER BY people.name ASC
    LIMIT 20;`;
    res.json(names);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// return movie title candidates with score
app.get("/search/movie/:name", async (req: Request, res: Response) => {
  const name: string = req.params.name;
  try {
    const data =
      await sql`SELECT DISTINCT movies.id,movies.title,movies.year,ratings.rating,ratings.votes
    FROM movies  
    JOIN ratings ON movies.id = ratings.movie_id
    WHERE movies.title ILIKE '%' || ${name} || '%'
    ORDER BY movies.year
    LIMIT 50;`;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  if (!ORIGIN) {
    console.log(`Server listening at http://localhost:${port}`);
  }
});
