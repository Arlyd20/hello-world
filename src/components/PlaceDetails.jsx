import React, { useEffect } from 'react';
import FavoriteButton from './FavoriteButton.jsx';

export default function PlaceDetails({ place, onClose, onViewMap }) {
  useEffect(() => {
    if (!place) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [place, onClose]);

  if (!place) return null;
  return (
    <div className="place-details-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="place-details-dialog" role="dialog" aria-modal="true" aria-labelledby="place-details-title">
        <button className="place-details-close" type="button" onClick={onClose} aria-label="Close place details">×</button>
        {place.image_url && <img className="place-details-image" src={place.image_url} alt="" />}
        <div className="place-details-body">
          <div className="place-details-meta"><span>{place.category}</span>{place.rating != null && <strong>★ {Number(place.rating).toFixed(1)}</strong>}</div>
          <h3 id="place-details-title">{place.name}</h3>
          <p>{place.description}</p>
          <address>{place.address}</address>
          <div className="place-card-actions">
            <button type="button" className="place-map-button" onClick={() => { onViewMap(place); onClose(); }}>View on Map</button>
            <FavoriteButton placeId={place.id} />
          </div>
        </div>
      </section>
    </div>
  );
}
