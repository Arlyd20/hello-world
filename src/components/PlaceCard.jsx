import React from 'react';
import FavoriteButton from './FavoriteButton.jsx';
import { distanceKm } from '../lib/geo.js';

const categoryNames = {
  attractions: 'Attraction', food: 'Food & drink', nature: 'Nature', beaches: 'Beach',
  culture: 'Culture', entertainment: 'Entertainment', shopping: 'Shopping',
  hotels: 'Stay', scenic: 'Scenic', activities: 'Activity'
};

export default function PlaceCard({ place, destination, isSelected, onViewMap, onViewDetails }) {
  const distance = destination ? distanceKm(destination, place) : null;
  return (
    <article className={`place-card${isSelected ? ' is-selected' : ''}`}>
      <div className="place-card-image">
        {place.image_url && <img src={place.image_url} alt="" loading="lazy" />}
        <span className="place-card-category">{categoryNames[place.category] || place.category}</span>
        <FavoriteButton placeId={place.id} />
      </div>
      <div className="place-card-content">
        <div className="place-card-heading"><h4>{place.name}</h4>{place.rating != null && <span className="place-rating">★ {Number(place.rating).toFixed(1)}</span>}</div>
        <p>{place.description}</p>
        <div className="place-card-meta">
          <span>{place.address}</span>
          {distance != null && <span>{distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}</span>}
        </div>
        <div className="place-card-actions">
          <button type="button" className="place-map-button" onClick={() => onViewMap(place)}>View on Map</button>
          <button type="button" className="place-details-button" onClick={() => onViewDetails(place)}>View Details</button>
        </div>
      </div>
    </article>
  );
}
