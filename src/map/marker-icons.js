import L from 'leaflet';

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

export function destinationIcon(name, country) {
  return L.divIcon({
    className: '',
    html: `<div class="destination-pin"><span class="destination-pin-label">${escapeHtml(name)}, ${escapeHtml(country)}</span><span class="destination-pin-core"><span>✦</span></span></div>`,
    iconSize: [48, 70],
    iconAnchor: [24, 66],
    popupAnchor: [0, -62]
  });
}

export function placeIcon(isSelected = false) {
  return L.divIcon({
    className: '',
    html: `<span class="place-pin${isSelected ? ' is-selected' : ''}"><span></span></span>`,
    iconSize: [30, 38],
    iconAnchor: [15, 31],
    popupAnchor: [0, -28]
  });
}

export function countryIcon(name, code) {
  return L.divIcon({
    className: '',
    html: `<span class="country-map-pin"><span>${escapeHtml(code)}</span><strong>${escapeHtml(name)}</strong></span>`,
    iconSize: [92, 36],
    iconAnchor: [46, 18]
  });
}
