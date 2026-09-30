import React, { useEffect, useState } from 'react';

const storageKey = 'hello-world-favorite-places';

function readFavorites() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return new Set(value.map(Number));
  } catch {
    return new Set();
  }
}

export default function FavoriteButton({ placeId }) {
  const [favorites, setFavorites] = useState(() => readFavorites());
  const isFavorite = favorites.has(Number(placeId));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...favorites]));
    } catch {
      return;
    }
  }, [favorites]);

  function toggleFavorite() {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(Number(placeId))) next.delete(Number(placeId));
      else next.add(Number(placeId));
      return next;
    });
  }

  return (
    <button className={`favorite-button${isFavorite ? ' is-favorite' : ''}`} type="button" aria-pressed={isFavorite} aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'} onClick={toggleFavorite}>
      <span aria-hidden="true">{isFavorite ? '♥' : '♡'}</span>
    </button>
  );
}
