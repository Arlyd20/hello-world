import { pool } from '../db.js';

const categories = new Set([
  'attractions', 'food', 'nature', 'beaches', 'culture',
  'entertainment', 'shopping', 'hotels', 'scenic', 'activities'
]);

function parseId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function rejectInvalidId(response) {
  return response.status(400).json({ error: 'A valid positive ID is required.' });
}

export async function getCountries(_request, response) {
  const [countries] = await pool.query(
    'SELECT id, name, code, latitude, longitude, description, image_url, created_at FROM countries ORDER BY name'
  );
  response.json(countries);
}

export async function getCountry(request, response) {
  const id = parseId(request.params.id);
  if (!id) return rejectInvalidId(response);
  const [[country]] = await pool.execute(
    'SELECT id, name, code, latitude, longitude, description, image_url, created_at FROM countries WHERE id = ?',
    [id]
  );
  if (!country) return response.status(404).json({ error: 'Country not found.' });
  const [cities] = await pool.execute(
    'SELECT id, country_id, name, latitude, longitude, description, image_url, created_at FROM cities WHERE country_id = ? ORDER BY name',
    [id]
  );
  response.json({ ...country, cities });
}

export async function getCities(request, response) {
  const countryId = request.query.country_id == null ? null : parseId(request.query.country_id);
  if (request.query.country_id != null && !countryId) return rejectInvalidId(response);
  const sql = `
    SELECT ci.id, ci.country_id, ci.name, ci.latitude, ci.longitude, ci.description, ci.image_url, ci.created_at,
           co.name AS country, co.code AS country_code
    FROM cities ci JOIN countries co ON co.id = ci.country_id
    ${countryId ? 'WHERE ci.country_id = ?' : ''}
    ORDER BY ci.name`;
  const [cities] = countryId ? await pool.execute(sql, [countryId]) : await pool.query(sql);
  response.json(cities);
}

export async function getCity(request, response) {
  const id = parseId(request.params.id);
  if (!id) return rejectInvalidId(response);
  const [[city]] = await pool.execute(
    `SELECT ci.id, ci.country_id, ci.name, ci.latitude, ci.longitude, ci.description, ci.image_url, ci.created_at,
            co.name AS country, co.code AS country_code
     FROM cities ci JOIN countries co ON co.id = ci.country_id WHERE ci.id = ?`,
    [id]
  );
  if (!city) return response.status(404).json({ error: 'City not found.' });
  response.json(city);
}

export async function getPlaces(request, response) {
  const cityIdValue = request.params.id ?? request.query.city_id;
  const cityId = parseId(cityIdValue);
  if (!cityId) return response.status(400).json({ error: 'A valid city_id is required.' });
  const category = request.query.category?.toString().toLowerCase();
  if (category && !categories.has(category)) {
    return response.status(400).json({ error: 'Unsupported place category.' });
  }
  const sql = `
    SELECT p.id, p.city_id, p.name, p.category, p.description, p.address, p.latitude, p.longitude,
           p.image_url, p.rating, p.created_at
    FROM places p
    WHERE p.city_id = ? ${category ? 'AND p.category = ?' : ''}
    ORDER BY p.rating DESC, p.name`;
  const params = category ? [cityId, category] : [cityId];
  const [places] = await pool.execute(sql, params);
  response.json(places);
}

export async function getPlace(request, response) {
  const id = parseId(request.params.id);
  if (!id) return rejectInvalidId(response);
  const [[place]] = await pool.execute(
    `SELECT p.id, p.city_id, p.name, p.category, p.description, p.address, p.latitude, p.longitude,
            p.image_url, p.rating, p.created_at, ci.name AS city, co.name AS country, co.code AS country_code
     FROM places p JOIN cities ci ON ci.id = p.city_id
     JOIN countries co ON co.id = ci.country_id WHERE p.id = ?`,
    [id]
  );
  if (!place) return response.status(404).json({ error: 'Place not found.' });
  response.json(place);
}

export async function searchCatalog(request, response) {
  const query = String(request.query.q || '').trim().slice(0, 100);
  if (query.length < 2) return response.json([]);
  const term = `%${query}%`;
  const [results] = await pool.execute(
    `SELECT * FROM (
       SELECT 'country' AS type, co.id AS id, co.name AS name, NULL AS city_id, NULL AS city_name,
              co.id AS country_id, co.code AS country_code, co.name AS country,
              co.latitude, co.longitude, co.description, co.image_url, NULL AS category
       FROM countries co WHERE co.name LIKE ? OR co.code LIKE ?
       UNION ALL
       SELECT 'city', ci.id, ci.name, ci.id, ci.name, co.id, co.code, co.name,
              ci.latitude, ci.longitude, ci.description, ci.image_url, NULL
       FROM cities ci JOIN countries co ON co.id = ci.country_id WHERE ci.name LIKE ?
       UNION ALL
       SELECT 'place', p.id, p.name, ci.id, ci.name, co.id, co.code, co.name,
              p.latitude, p.longitude, p.description, p.image_url, p.category
       FROM places p JOIN cities ci ON ci.id = p.city_id
       JOIN countries co ON co.id = ci.country_id WHERE p.name LIKE ?
     ) AS matches ORDER BY CASE type WHEN 'city' THEN 0 WHEN 'country' THEN 1 ELSE 2 END, name LIMIT 24`,
    [term, term, term, term]
  );
  response.json(results);
}
