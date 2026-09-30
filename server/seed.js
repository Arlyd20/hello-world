import 'dotenv/config';
import { randomBytes, scryptSync } from 'node:crypto';
import { pool } from './db.js';

const countries = [
  { code: 'JP', name: 'Japan', lat: 36.2048, lng: 138.2529, description: 'Island journeys from ancient temples to neon-lit cities.', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80' },
  { code: 'IT', name: 'Italy', lat: 41.8719, lng: 12.5674, description: 'Historic cities, coastal villages, and a table worth gathering around.', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80' },
  { code: 'MA', name: 'Morocco', lat: 31.7917, lng: -7.0926, description: 'Mountain passes, desert horizons, and the colors of the medina.', image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80' },
  { code: 'AR', name: 'Argentina', lat: -38.4161, lng: -63.6167, description: 'From lively boulevards to the vast trails of Patagonia.', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80' },
  { code: 'IS', name: 'Iceland', lat: 64.9631, lng: -19.0208, description: 'Volcanic coastlines, northern light, and geothermal warmth.', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80' },
  { code: 'NP', name: 'Nepal', lat: 28.3949, lng: 84.124, description: 'Living heritage and mountain routes above the Kathmandu Valley.', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80' },
  { code: 'FR', name: 'France', lat: 46.2276, lng: 2.2137, description: 'City culture, village markets, and varied landscapes.', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
  { code: 'US', name: 'United States', lat: 39.8283, lng: -98.5795, description: 'Big-city neighborhoods and wide-open national parks.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { code: 'KE', name: 'Kenya', lat: -0.0236, lng: 37.9062, description: 'Savannah horizons, wildlife, and vibrant coastal towns.', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80' },
  { code: 'EG', name: 'Egypt', lat: 26.8206, lng: 30.8025, description: 'A long river journey through ancient and modern places.', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=80' },
  { code: 'NZ', name: 'New Zealand', lat: -40.9006, lng: 174.886, description: 'Coastal paths, alpine tracks, and welcoming small cities.', image: 'https://images.unsplash.com/photo-1469521669194-babb45599def?auto=format&fit=crop&w=1200&q=80' },
  { code: 'BR', name: 'Brazil', lat: -14.235, lng: -51.9253, description: 'Atlantic beaches, music-filled streets, and rainforest routes.', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80' }
];

const cities = [
  ['JP', 'Tokyo', 35.6762, 139.6503, 'A city of distinct neighborhoods, late-night energy, gardens, and deep-rooted craft.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80'],
  ['JP', 'Kyoto', 35.0116, 135.7681, 'Temple paths, lantern-lit lanes, and seasonal traditions.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'],
  ['JP', 'Osaka', 34.6937, 135.5023, 'A welcoming food city with a lively waterfront and rich history.', 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1200&q=80'],
  ['IT', 'Rome', 41.9028, 12.4964, 'Ancient landmarks and everyday life meet around every corner.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80'],
  ['IT', 'Amalfi Coast', 40.6281, 14.4849, 'Cliffside villages follow a bright stretch of Mediterranean coast.', 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=1200&q=80'],
  ['MA', 'Marrakech', 31.6295, -7.9811, 'A historic medina of workshops, courtyards, gardens, and souks.', 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80'],
  ['AR', 'El Chalten', -49.3315, -72.8863, 'A trail town beneath the granite peaks of southern Patagonia.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'],
  ['IS', 'Reykjavik', 64.1466, -21.9426, 'A compact northern capital close to geothermal pools and wild coast.', 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=80'],
  ['NP', 'Kathmandu', 27.7172, 85.324, 'A historic valley city with lively squares and mountain views.', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80'],
  ['FR', 'Paris', 48.8566, 2.3522, 'Neighborhood cafes, museums, and riverside walks.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'],
  ['US', 'New York', 40.7128, -74.006, 'A city of distinct boroughs, public parks, and independent culture.', 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1200&q=80'],
  ['KE', 'Nairobi', -1.2921, 36.8219, 'An energetic city with green spaces and a lively creative scene.', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80'],
  ['EG', 'Cairo', 30.0444, 31.2357, 'A layered river city shaped by centuries of movement and trade.', 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80'],
  ['NZ', 'Auckland', -36.8509, 174.7645, 'Harborside neighborhoods between volcanic cones and the sea.', 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80'],
  ['BR', 'Rio de Janeiro', -22.9068, -43.1729, 'Beaches, hillside neighborhoods, music, and monumental views.', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80']
];

const places = [
  ['Tokyo', 'Tokyo Tower', 'attractions', 'One of Tokyo’s best-known landmarks, with panoramic city views from its observation decks.', '4-2-8 Shiba-koen, Minato City', 35.6586, 139.7454, 4.7, 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=900&q=80'],
  ['Tokyo', 'Shibuya Crossing', 'scenic', 'Watch the city move through one of the world’s busiest and most recognizable crossings.', 'Shibuya City, Tokyo', 35.6595, 139.7005, 4.6, 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=900&q=80'],
  ['Tokyo', 'Senso-ji Temple', 'culture', 'Explore a historic Buddhist temple and the market street leading to its main hall.', '2-3-1 Asakusa, Taito City', 35.7148, 139.7967, 4.8, 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?auto=format&fit=crop&w=900&q=80'],
  ['Tokyo', 'Meiji Shrine', 'culture', 'Walk a forested approach to a peaceful Shinto shrine beside the city center.', '1-1 Yoyogikamizonocho, Shibuya City', 35.6764, 139.6993, 4.7, 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80'],
  ['Tokyo', 'Ueno Park', 'nature', 'A spacious city park known for museums, ponds, and seasonal blossoms.', 'Uenokoen, Taito City', 35.7148, 139.7732, 4.5, 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=900&q=80'],
  ['Tokyo', 'teamLab Borderless', 'entertainment', 'Explore immersive digital artworks in a museum without fixed boundaries.', 'Azabudai Hills, Minato City', 35.6602, 139.7307, 4.6, 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=900&q=80'],
  ['Tokyo', 'Tsukiji Outer Market', 'food', 'Sample market favorites and browse specialist food shops in the old market district.', '4-16-2 Tsukiji, Chuo City', 35.6654, 139.7707, 4.5, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80'],
  ['Kyoto', 'Fushimi Inari Taisha', 'culture', 'Follow thousands of vermilion torii gates along wooded paths up Mount Inari.', '68 Fukakusa Yabunouchicho, Fushimi Ward', 34.9671, 135.7727, 4.9, 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=900&q=80'],
  ['Kyoto', 'Kinkaku-ji', 'attractions', 'See the Golden Pavilion reflected in the pond gardens around the temple.', '1 Kinkakujicho, Kita Ward', 35.0394, 135.7292, 4.7, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80'],
  ['Kyoto', 'Arashiyama Bamboo Grove', 'nature', 'Walk beneath tall bamboo near the Katsura River and historic Arashiyama district.', 'Sagaogurayama Tabuchiyamacho, Ukyo Ward', 35.017, 135.6713, 4.5, 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80'],
  ['Osaka', 'Osaka Castle', 'culture', 'Discover the museum and expansive park surrounding a landmark castle.', '1-1 Osakajo, Chuo Ward', 34.6873, 135.5262, 4.6, 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=900&q=80'],
  ['Osaka', 'Dotonbori', 'food', 'Find Osaka street food, canal-side walks, and bright signs in the city center.', 'Dotonbori, Chuo Ward', 34.6687, 135.5023, 4.5, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80'],
  ['Osaka', 'Universal Studios Japan', 'entertainment', 'Spend a day among themed worlds and rides at Osaka Bay.', '2-1-33 Sakurajima, Konohana Ward', 34.6654, 135.4323, 4.6, 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=900&q=80'],
  ['Rome', 'Colosseum', 'culture', 'Visit the vast ancient amphitheater at the heart of imperial Rome.', 'Piazza del Colosseo, Rome', 41.8902, 12.4922, 4.8, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=80'],
  ['Rome', 'Campo de’ Fiori Market', 'food', 'Browse a lively produce market in one of Rome’s historic squares.', 'Piazza Campo de’ Fiori, Rome', 41.8956, 12.4722, 4.4, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'],
  ['Marrakech', 'Jemaa el-Fnaa', 'culture', 'Experience the central square’s food stalls, performers, and evening bustle.', 'Jemaa el-Fnaa, Marrakech', 31.6258, -7.9891, 4.6, 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=900&q=80'],
  ['Marrakech', 'Majorelle Garden', 'nature', 'Wander through a botanical garden of palms, cacti, and vivid blue architecture.', 'Rue Yves Saint Laurent, Marrakech', 31.6416, -8.0034, 4.5, 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80'],
  ['Paris', 'Eiffel Tower', 'attractions', 'Take in city views from the iron landmark beside the Seine.', 'Champ de Mars, Paris', 48.8584, 2.2945, 4.7, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80'],
  ['New York', 'Central Park', 'nature', 'Find paths, lawns, and quiet corners across Manhattan’s best-known park.', 'Central Park, New York', 40.7829, -73.9654, 4.8, 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=900&q=80'],
  ['Rio de Janeiro', 'Copacabana Beach', 'beaches', 'Follow the wave-pattern promenade along Rio’s iconic city beach.', 'Copacabana, Rio de Janeiro', -22.9711, -43.1822, 4.6, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=80'],
  ['El Chalten', 'Laguna de los Tres Trail', 'activities', 'Hike toward a glacial lake beneath the dramatic Fitz Roy massif.', 'Sendero Laguna de los Tres, El Chalten', -49.2712, -73.0437, 4.9, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80']
];

const disabledPasswordSalt = randomBytes(16);
const disabledPasswordHash = `disabled$scrypt$${disabledPasswordSalt.toString('hex')}$${scryptSync('no-login-account', disabledPasswordSalt, 64).toString('hex')}`;

async function seed() {
  let connection;
  let transactionStarted = false;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;
    await connection.execute(
      `INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Guest Traveler', 'guest@hello-world.local', ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [disabledPasswordHash]
    );

    for (const country of countries) {
      await connection.execute(
        `INSERT INTO countries (name, code, latitude, longitude, description, image_url) VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), latitude = VALUES(latitude), longitude = VALUES(longitude), description = VALUES(description), image_url = VALUES(image_url)`,
        [country.name, country.code, country.lat, country.lng, country.description, country.image]
      );
    }

    const [countryRows] = await connection.query('SELECT id, code FROM countries');
    const countryIds = new Map(countryRows.map((country) => [country.code, country.id]));
    for (const [code, name, latitude, longitude, description, image] of cities) {
      await connection.execute(
        `INSERT INTO cities (country_id, name, latitude, longitude, description, image_url) VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude), description = VALUES(description), image_url = VALUES(image_url)`,
        [countryIds.get(code), name, latitude, longitude, description, image]
      );
    }

    const [cityRows] = await connection.query('SELECT id, name FROM cities');
    const cityIds = new Map(cityRows.map((city) => [city.name, city.id]));
    for (const [city, name, category, description, address, latitude, longitude, rating, image] of places) {
      await connection.execute(
        `INSERT INTO places (city_id, name, category, description, address, latitude, longitude, rating, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE category = VALUES(category), description = VALUES(description), address = VALUES(address), latitude = VALUES(latitude), longitude = VALUES(longitude), rating = VALUES(rating), image_url = VALUES(image_url)`,
        [cityIds.get(city), name, category, description, address, latitude, longitude, rating, image]
      );
    }

    await connection.commit();
    transactionStarted = false;
    console.log(`Seeded ${countries.length} countries, ${cities.length} cities, and ${places.length} places.`);
  } catch (error) {
    if (transactionStarted) await connection.rollback().catch(() => {});
    console.error('Database seed failed. Check the schema and DB_* values in .env.');
    throw error;
  } finally {
    connection?.release();
    await pool.end();
  }
}

seed().catch(() => { process.exitCode = 1; });
