# New Corona School Backend

### Overview

This repository contains the new Corona School Backend. It has the following structure:
- `apollo` contains all files relevant for the _GraphQL_ API implementation.
- `rest` contains the fails relevant to the (legacy) REST API
- In `prisma` the data schema is defined
- `server` contaons the implementation of the _Express_-Server

### Getting Started

You can either use _Docker_ or run the server directlly on your machine.

#### Docker

If you run the container for the first time use `docker-compose up --build`. In the case you already have a built container, just run `docker-compose up`. This will start the node server as well as the postgreSQL database. The server will run on port 5000. The latter is migrated with the migration container.
In order to run a migration just rerun the migration container.

#### Run directly

Make sure you have an active postgreSQL database. Add a `.env` file to your cloned repository:
```
DATABASE_URL="$DATABASE_URL"
PORT=$PORT
```
Then run the server with `npm run server:dev`. To run the database migrations use `npm run migration:dev`.



