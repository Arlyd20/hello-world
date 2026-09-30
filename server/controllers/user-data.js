import { pool } from '../db.js';

function positiveId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function userIdFrom(request) {
  const value = request.body?.user_id ?? request.query.user_id ?? 1;
  return positiveId(value);
}

export async function getFavorites(request, response) {
  const userId = userIdFrom(request);
  if (!userId) return response.status(400).json({ error: 'A valid user_id is required.' });
  const [favorites] = await pool.execute(
    `SELECT f.id, f.user_id, f.place_id, f.created_at, p.name, p.category, p.city_id,
            ci.name AS city, co.name AS country
     FROM favorites f JOIN places p ON p.id = f.place_id
     JOIN cities ci ON ci.id = p.city_id JOIN countries co ON co.id = ci.country_id
     WHERE f.user_id = ? ORDER BY f.created_at DESC`,
    [userId]
  );
  response.json(favorites);
}

export async function addFavorite(request, response) {
  const userId = userIdFrom(request);
  const placeId = positiveId(request.body?.place_id);
  if (!userId || !placeId) return response.status(400).json({ error: 'Valid user_id and place_id are required.' });
  const [result] = await pool.execute(
    'INSERT IGNORE INTO favorites (user_id, place_id) VALUES (?, ?)',
    [userId, placeId]
  );
  const [[favorite]] = await pool.execute(
    'SELECT id, user_id, place_id, created_at FROM favorites WHERE user_id = ? AND place_id = ?',
    [userId, placeId]
  );
  if (!favorite) return response.status(404).json({ error: 'User or place not found.' });
  response.status(result.affectedRows ? 201 : 200).json(favorite);
}

export async function deleteFavorite(request, response) {
  const id = positiveId(request.params.id);
  const userId = userIdFrom(request);
  if (!id || !userId) return response.status(400).json({ error: 'Valid favorite and user IDs are required.' });
  const [result] = await pool.execute('DELETE FROM favorites WHERE id = ? AND user_id = ?', [id, userId]);
  if (!result.affectedRows) return response.status(404).json({ error: 'Favorite not found.' });
  response.status(204).end();
}

export async function getItineraries(request, response) {
  const userId = userIdFrom(request);
  if (!userId) return response.status(400).json({ error: 'A valid user_id is required.' });
  const [itineraries] = await pool.execute(
    `SELECT i.id, i.user_id, i.name, i.description, i.created_at, COUNT(ip.id) AS place_count
     FROM itineraries i LEFT JOIN itinerary_places ip ON ip.itinerary_id = i.id
     WHERE i.user_id = ? GROUP BY i.id ORDER BY i.created_at DESC`,
    [userId]
  );
  response.json(itineraries);
}

export async function createItinerary(request, response) {
  const userId = userIdFrom(request);
  const name = typeof request.body?.name === 'string' ? request.body.name.trim().slice(0, 160) : '';
  const description = typeof request.body?.description === 'string' ? request.body.description.trim().slice(0, 5000) : null;
  const placeIds = request.body?.place_ids ?? [];
  if (!userId || !name || !Array.isArray(placeIds) || placeIds.length > 25) {
    return response.status(400).json({ error: 'A valid user_id, itinerary name, and up to 25 place IDs are required.' });
  }
  const parsedPlaceIds = [...new Set(placeIds.map(positiveId))];
  if (parsedPlaceIds.some((id) => !id)) return response.status(400).json({ error: 'Every place ID must be a positive integer.' });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [created] = await connection.execute(
      'INSERT INTO itineraries (user_id, name, description) VALUES (?, ?, ?)',
      [userId, name, description || null]
    );
    if (parsedPlaceIds.length) {
      const values = parsedPlaceIds.map((_, index) => `(${created.insertId}, ?, ${index + 1}, NULL)`).join(', ');
      await connection.execute(
        `INSERT INTO itinerary_places (itinerary_id, place_id, visit_order, notes) VALUES ${values}`,
        parsedPlaceIds
      );
    }
    await connection.commit();
    response.status(201).json({ id: created.insertId, user_id: userId, name, description, place_ids: parsedPlaceIds });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return response.status(404).json({ error: 'User or place not found.' });
    }
    throw error;
  } finally {
    connection.release();
  }
}
