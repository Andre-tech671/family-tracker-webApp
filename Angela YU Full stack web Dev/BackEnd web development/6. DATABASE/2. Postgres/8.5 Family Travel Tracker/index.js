import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});
db.connect();

async function initializeDatabase() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS countries (
        country_code CHAR(2) PRIMARY KEY,
        country_name VARCHAR(50)
      );
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(15) UNIQUE NOT NULL,
        color VARCHAR(15)
      );
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS visited_countries(
        id SERIAL PRIMARY KEY,
        country_code CHAR(2) NOT NULL,
        user_id INTEGER REFERENCES users(id)
      );
    `);
    // Insert initial countries data if empty (add more as needed for full functionality)
    const countryResult = await db.query("SELECT COUNT(*) FROM countries");
    if (parseInt(countryResult.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO countries (country_code, country_name) VALUES
        ('FR', 'France'),
        ('GB', 'United Kingdom'),
        ('CA', 'Canada'),
        ('US', 'United States'),
        ('DE', 'Germany'),
        ('IT', 'Italy'),
        ('ES', 'Spain'),
        ('JP', 'Japan'),
        ('AU', 'Australia'),
        ('BR', 'Brazil')
        -- Add more countries for complete search functionality
      `);
    }
    // Insert initial data if users table is empty
    const userResult = await db.query("SELECT COUNT(*) FROM users");
    if (parseInt(userResult.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO users (name, color)
        VALUES ('Angela', 'teal'), ('Jack', 'powderblue');
      `);
      await db.query(`
        INSERT INTO visited_countries (country_code, user_id)
        VALUES ('FR', 1), ('GB', 1), ('CA', 2), ('FR', 2);
      `);
    }
  } catch (err) {
    console.error("Error initializing database:", err);
  }
}

await initializeDatabase();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

async function checkVisisted() {
  const result = await db.query(
    "SELECT country_code FROM visited_countries JOIN users ON users.id = user_id WHERE user_id = $1; ",
    [currentUserId]
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  return users.find((user) => user.id == currentUserId);
}

app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const currentUser = await getCurrentUser();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];
  const currentUser = await getCurrentUser();

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  const name = req.body.name;
  const color = req.body.color;

  const result = await db.query(
    "INSERT INTO users (name, color) VALUES($1, $2) RETURNING *;",
    [name, color]
  );

  const id = result.rows[0].id;
  currentUserId = id;

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
