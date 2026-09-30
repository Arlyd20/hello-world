import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import SearchBar from './SearchBar.jsx';
import WorldMap from './WorldMap.jsx';
import DestinationPanel from './DestinationPanel.jsx';
import PlaceDetails from './PlaceDetails.jsx';

export default function DestinationDiscovery() {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [places, setPlaces] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [detailsPlace, setDetailsPlace] = useState(null);
  const [category, setCategory] = useState('');
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.countries()
      .then((items) => { if (active) setCountries(items); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoadingCountries(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleHeroSelection = (event) => { chooseSearchResult(event.detail); };
    window.addEventListener('hello-world:select-place', handleHeroSelection);
    if (window.helloWorldPendingSelection) {
      handleHeroSelection({ detail: window.helloWorldPendingSelection });
      window.helloWorldPendingSelection = null;
    }
    return () => window.removeEventListener('hello-world:select-place', handleHeroSelection);
  }, [countries]);

  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      return undefined;
    }
    let active = true;
    setLoadingCities(true);
    api.cities(selectedCountry.id)
      .then((items) => { if (active) setCities(items); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoadingCities(false); });
    return () => { active = false; };
  }, [selectedCountry?.id]);

  useEffect(() => {
    if (!selectedCity) {
      setPlaces([]);
      setLoadingPlaces(false);
      return undefined;
    }
    let active = true;
    setLoadingPlaces(true);
    setError('');
    api.places(selectedCity.id, category)
      .then((items) => { if (active) setPlaces(items); })
      .catch((requestError) => { if (active) { setPlaces([]); setError(requestError.message); } })
      .finally(() => { if (active) setLoadingPlaces(false); });
    return () => { active = false; };
  }, [selectedCity?.id, category]);

  function selectCountry(country) {
    setSelectedCountry(country);
    setSelectedCity(null);
    setSelectedPlace(null);
    setCategory('');
    setError('');
  }

  function selectCity(city, countryOverride) {
    const country = countryOverride
      || countries.find((item) => item.id === city.country_id)
      || (city.country_id ? {
        id: city.country_id,
        name: city.country,
        code: city.country_code,
        latitude: city.latitude,
        longitude: city.longitude
      } : selectedCountry);
    setSelectedCountry(country);
    setSelectedCity(city);
    setSelectedPlace(null);
    setCategory('');
    setError('');
  }

  function selectPlace(place) {
    setSelectedPlace(place);
    setDetailsPlace(null);
  }

  function changeCategory(nextCategory) {
    setCategory(nextCategory);
    setSelectedPlace(null);
  }

  async function chooseSearchResult(result) {
    setError('');
    try {
      if (result.type === 'country') {
        const country = countries.find((item) => item.id === result.id) || await api.country(result.id);
        selectCountry(country);
        return;
      }
      if (result.type === 'city') {
        const city = await api.city(result.id);
        const country = countries.find((item) => item.id === city.country_id);
        setSelectedCountry(country || { id: city.country_id, name: city.country, code: city.country_code, latitude: city.latitude, longitude: city.longitude });
        selectCity(city, country);
        return;
      }
      const place = await api.place(result.id);
      const city = await api.city(place.city_id);
      const country = countries.find((item) => item.id === city.country_id);
      setSelectedCountry(country || { id: city.country_id, name: city.country, code: city.country_code, latitude: city.latitude, longitude: city.longitude });
      setSelectedCity(city);
      setCategory('');
      setSelectedPlace(place);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function resetWorld() {
    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedPlace(null);
    setCategory('');
    setError('');
  }

  const shownPlaces = selectedPlace
    ? [...places].sort((first, second) => Number(second.id === selectedPlace.id) - Number(first.id === selectedPlace.id))
    : places;

  return (
    <div className="explore-map-layout">
      <div className="world-map-panel">
        <WorldMap
          countries={countries}
          cities={cities}
          places={places}
          selectedCountry={selectedCountry}
          selectedCity={selectedCity}
          selectedPlace={selectedPlace}
          onSelectCountry={selectCountry}
          onSelectCity={selectCity}
          onSelectPlace={selectPlace}
        />
        <SearchBar onChoose={chooseSearchResult} />
        <div className="map-live-status" role="status" aria-live="polite">
          {loadingCountries ? 'Loading world destinations…' : error && !selectedCity ? error : selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : 'OpenStreetMap · Explore the world'}
        </div>
      </div>
      <DestinationPanel
        countries={countries}
        cities={cities}
        selectedCountry={selectedCountry}
        selectedCity={selectedCity}
        selectedPlace={selectedPlace}
        places={shownPlaces}
        category={category}
        onCategoryChange={changeCategory}
        onSelectCountry={selectCountry}
        onSelectCity={selectCity}
        onViewMap={selectPlace}
        onViewDetails={setDetailsPlace}
        loadingCities={loadingCities}
        loadingPlaces={loadingPlaces}
        error={error}
        onClearSelection={resetWorld}
      />
      <PlaceDetails place={detailsPlace} onClose={() => setDetailsPlace(null)} onViewMap={selectPlace} />
    </div>
  );
}
