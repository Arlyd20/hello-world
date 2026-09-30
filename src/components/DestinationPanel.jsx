import React from 'react';
import { countryFlag } from '../lib/geo.js';
import CategoryFilter from './CategoryFilter.jsx';
import PlaceCard from './PlaceCard.jsx';

export default function DestinationPanel({
  countries, cities, selectedCountry, selectedCity, selectedPlace, places,
  category, onCategoryChange, onSelectCountry, onSelectCity, onViewMap,
  onViewDetails, loadingCities, loadingPlaces, error, onClearSelection
}) {
  return (
    <aside className="discovery-panel" aria-label="Destination discovery">
      <div className="discovery-panel-topline">
        <span className="discovery-kicker">Your travel atlas</span>
        {selectedCountry && <button type="button" className="panel-reset" onClick={onClearSelection}>World view</button>}
      </div>

      {!selectedCountry && (
        <>
          <h3>Pick a place<br />to begin.</h3>
          <p className="panel-intro">Choose a country on the map or search a destination to start exploring.</p>
          <div className="country-list">
            {countries.map((country) => (
              <button className="country-option" type="button" key={country.id} onClick={() => onSelectCountry(country)}>
                <span className="country-option-flag">{countryFlag(country.code)}</span>
                <span><strong>{country.name}</strong><small>{country.city_count ? `${country.city_count} destinations` : 'Explore country'}</small></span>
                <span className="country-option-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </>
      )}

      {selectedCountry && !selectedCity && (
        <>
          <div className="destination-title-row"><span className="destination-flag">{countryFlag(selectedCountry.code)}</span><div><span className="destination-overline">Country</span><h3>{selectedCountry.name}</h3></div></div>
          <p className="panel-intro">{selectedCountry.description}</p>
          <h4 className="panel-section-title">Choose a city</h4>
          {loadingCities ? <p className="panel-state">Loading cities…</p> : null}
          {!loadingCities && cities.length === 0 && <p className="panel-state">No cities are available for this country yet.</p>}
          <div className="city-list">
            {cities.map((city) => (
              <button className="city-option" type="button" key={city.id} onClick={() => onSelectCity(city)}>
                {city.image_url && <img src={city.image_url} alt="" loading="lazy" />}
                <span><strong>{city.name}</strong><small>{city.country}</small></span><span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </>
      )}

      {selectedCity && (
        <>
          <div className="destination-title-row"><span className="destination-flag">{countryFlag(selectedCity.country_code || selectedCountry?.code)}</span><div><span className="destination-overline">{selectedCity.country}</span><h3>{selectedCity.name}</h3></div></div>
          <h4 className="discover-city-title">Discover {selectedCity.name}</h4>
          <p className="panel-intro">{selectedCity.description}</p>
          <CategoryFilter value={category} onChange={onCategoryChange} />
          <div className="places-heading"><h4>Places to explore</h4><span>{loadingPlaces ? '…' : places.length}</span></div>
          {error && <p className="panel-error" role="status">{error}</p>}
          {loadingPlaces && <div className="place-skeletons" aria-label="Loading places"><span /><span /><span /></div>}
          {!loadingPlaces && !error && places.length === 0 && <p className="panel-state">No places in this category yet. Try another filter.</p>}
          {!loadingPlaces && places.length > 0 && (
            <div className="places-list">
              {places.map((place) => <PlaceCard key={place.id} place={place} destination={selectedCity} isSelected={selectedPlace?.id === place.id} onViewMap={onViewMap} onViewDetails={onViewDetails} />)}
            </div>
          )}
        </>
      )}
      {error && !selectedCity && <p className="panel-error" role="status">{error}</p>}
    </aside>
  );
}
