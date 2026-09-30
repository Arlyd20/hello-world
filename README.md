# Hello World

A virtual travel and discovery app. The homepage keeps its 3D Earth identity; the Explore Map uses Leaflet, OpenStreetMap tiles, and destination data from a MySQL-backed Express API.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MySQL 8.0+

## Installation

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
npm install
Copy-Item .env.example .env
```

Set your local MySQL host, user, and password in `.env`. `.env` is ignored by Git. No Google Maps keys or external place-search credentials are used.

## Database setup

Start MySQL, then apply the schema from PowerShell:

```powershell
cmd /c "mysql -u root -p < database/schema.sql"
npm run seed
```

The schema creates the `hello_world` database and the `users`, `countries`, `cities`, `places`, `favorites`, `itineraries`, and `itinerary_places` tables. The seed is safe to rerun and supplies 12 countries, 15 cities, and 21 places, including Tokyo, Kyoto, and Osaka attractions.

## Environment

`.env.example` lists the backend settings. Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`; `PORT` defaults to `3001`, and `FRONTEND_ORIGIN` controls API CORS. Keep actual credentials in the ignored `.env` file only.

## Run

Use separate terminals:

```powershell
npm run server
```

```powershell
npm run dev
```

Open the Vite URL printed in the frontend terminal. The API also remains available when MySQL is down and returns a friendly `503` from `/api/health` until the database is ready.

## Publish on Railway

The repository includes a multi-stage `Dockerfile` and `railway.json`. One Railway service builds the Vite site and serves it with Express; a Railway MySQL service provides the database.

1. Push this repository to GitHub and create a Railway project from `Arlyd20/Hello-World` using the `main` branch. Railway detects the Dockerfile.
2. Add a MySQL service to the same Railway project.
3. In the app service, add these variables using Railway's reference picker for the MySQL service (shown as `MySQL` below):

	```env
	DB_HOST=${{MySQL.MYSQLHOST}}
	DB_PORT=${{MySQL.MYSQLPORT}}
	DB_USER=${{MySQL.MYSQLUSER}}
	DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
	DB_NAME=${{MySQL.MYSQLDATABASE}}
	```

4. Open the app service shell and run `npm run db:setup` once to create the tables and seed sample destinations. The service health check uses `/api/health`.
5. Generate a Railway public domain for the app service. The frontend and API share this domain; if deploying a separate frontend, set `FRONTEND_ORIGIN` to its exact HTTPS origin.
6. Add the generated public URL to the Hello World project card in the portfolio repository, then publish the portfolio changes through GitHub Pages.

Do not commit database credentials. Enter them only as Railway service variables; no database secret is exposed to Vite/browser code.

## API

- `GET /api/health`
- `GET /api/countries` and `/api/countries/:id`
- `GET /api/cities` and `/api/cities/:id`
- `GET /api/cities/:id/places?category=food`
- `GET /api/places/:id`
- `GET /api/search?q=Tokyo`
- `GET|POST /api/favorites`, `DELETE /api/favorites/:id`
- `GET|POST /api/itineraries`

Search, cities, and attraction cards use the database API. Categories and favorites are kept in separate components/services; the unauthenticated favorite control uses local storage until account flows are added. `src/map/tiles.js` owns the OSM tile provider configuration, and `src/services/api.js` is the frontend API boundary.
