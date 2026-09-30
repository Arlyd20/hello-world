const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${apiBase}/api${path}`, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
    });
  } catch {
    throw new Error('Travel data is unavailable. Start the backend API and MySQL, then try again.');
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (response.status === 500 || response.status === 503) {
    throw new Error('Travel data is unavailable. Make sure MySQL is running and the backend API is started.');
  }
  if (!response.ok) throw new Error(payload?.error || 'The travel request could not be completed.');
  return payload;
}

const query = (values) => new URLSearchParams(values).toString();
const json = (body) => ({ method: 'POST', body: JSON.stringify(body) });

export const api = {
  health: () => request('/health'),
  countries: () => request('/countries'),
  country: (id) => request(`/countries/${id}`),
  cities: (countryId) => request(`/cities${countryId ? `?${query({ country_id: countryId })}` : ''}`),
  city: (id) => request(`/cities/${id}`),
  places: (cityId, category) => request(`/cities/${cityId}/places${category ? `?${query({ category })}` : ''}`),
  place: (id) => request(`/places/${id}`),
  search: (text) => request(`/search?${query({ q: text })}`),
  favorites: (userId = 1) => request(`/favorites?${query({ user_id: userId })}`),
  addFavorite: (placeId, userId = 1) => request('/favorites', json({ user_id: userId, place_id: placeId })),
  removeFavorite: (favoriteId, userId = 1) => request(`/favorites/${favoriteId}?${query({ user_id: userId })}`, { method: 'DELETE' }),
  itineraries: (userId = 1) => request(`/itineraries?${query({ user_id: userId })}`),
  createItinerary: (body) => request('/itineraries', json(body))
};
