import React, { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { openStreetMapTiles } from '../map/tiles.js';
import { countryIcon, destinationIcon, placeIcon } from '../map/marker-icons.js';

const worldCenter = [20, 0];

function MapCamera({ country, city, place }) {
  const map = useMap();
  useEffect(() => {
    if (place) map.flyTo([place.latitude, place.longitude], 15, { duration: 1.15 });
    else if (city) map.flyTo([city.latitude, city.longitude], 11, { duration: 1.15 });
    else if (country) map.flyTo([country.latitude, country.longitude], 5, { duration: 1.15 });
  }, [map, country, city, place]);
  return null;
}

function position(item) {
  return [Number(item.latitude), Number(item.longitude)];
}

export default function WorldMap({ countries, cities, places, selectedCountry, selectedCity, selectedPlace, onSelectCountry, onSelectCity, onSelectPlace }) {
  return (
    <MapContainer className="leaflet-world-map" center={worldCenter} zoom={2} minZoom={2} maxZoom={18} scrollWheelZoom zoomControl worldCopyJump>
      <TileLayer url={openStreetMapTiles.url} attribution={openStreetMapTiles.attribution} subdomains={openStreetMapTiles.subdomains} maxZoom={openStreetMapTiles.maxZoom} />
      <MapCamera country={selectedCountry} city={selectedCity} place={selectedPlace} />

      {!selectedCountry && countries.map((country) => (
        <Marker key={`country-${country.id}`} position={position(country)} icon={countryIcon(country.name, country.code)} eventHandlers={{ click: () => onSelectCountry(country) }}>
          <Popup><strong>{country.name}</strong><br />Choose a city to explore</Popup>
        </Marker>
      ))}

      {selectedCountry && !selectedCity && cities.map((city) => (
        <Marker key={`city-${city.id}`} position={position(city)} icon={destinationIcon(city.name, city.country)} eventHandlers={{ click: () => onSelectCity(city) }}>
          <Popup><strong>{city.name}</strong><br />{city.country}</Popup>
        </Marker>
      ))}

      {selectedCity && (
        <Marker position={position(selectedCity)} icon={destinationIcon(selectedCity.name, selectedCity.country)} zIndexOffset={1000}>
          <Popup><strong>{selectedCity.name}, {selectedCity.country}</strong><br />Your selected destination</Popup>
        </Marker>
      )}

      {selectedCity && places.map((place) => (
        <Marker key={`place-${place.id}`} position={position(place)} icon={placeIcon(selectedPlace?.id === place.id)} eventHandlers={{ click: () => onSelectPlace(place) }}>
          <Popup><strong>{place.name}</strong><br />{place.category}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
