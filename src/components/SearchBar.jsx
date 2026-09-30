import React, { useState } from 'react';
import { api } from '../services/api.js';
import { countryFlag } from '../lib/geo.js';

export default function SearchBar({ onChoose }) {
  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('Search countries, cities, and places.');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = value.trim();
    if (text.length < 2) {
      setResults([]);
      setStatus('Enter at least two characters to search.');
      return;
    }
    setLoading(true);
    setStatus('Searching the travel catalog…');
    try {
      const matches = await api.search(text);
      setResults(matches);
      setStatus(matches.length ? `${matches.length} places found. Choose one to explore.` : 'No matches. Try a city, country, or attraction.');
    } catch (error) {
      setResults([]);
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  function choose(result) {
    setValue(result.name);
    setResults([]);
    onChoose(result);
  }

  return (
    <div className="travel-search">
      <form className="travel-search-form" role="search" onSubmit={handleSubmit}>
        <span aria-hidden="true">⌕</span>
        <input aria-label="Search destinations and places" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search countries, cities, places" autoComplete="off" />
        <button type="submit" disabled={loading} aria-label="Search">
          {loading ? <span className="search-spinner" aria-hidden="true" /> : '↗'}
        </button>
      </form>
      <p className="travel-search-status" role="status" aria-live="polite">{status}</p>
      {results.length > 0 && (
        <div className="travel-search-results" role="listbox" aria-label="Travel search results">
          {results.map((result) => (
            <button key={`${result.type}-${result.id}`} role="option" aria-selected="false" type="button" onClick={() => choose(result)}>
              <span className="search-result-flag">{countryFlag(result.country_code)}</span>
              <span><strong>{result.name}</strong><small>{result.type} · {[result.city_name, result.country].filter(Boolean).join(', ')}</small></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
