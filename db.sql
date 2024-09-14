CREATE TABLE actors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    date_of_birth DATE
);

CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    creation_date DATE,
    actor_id INTEGER REFERENCES actors(id)
);
