const mapSection = document.querySelector('#map');
let mapLoaded = false;
let mapObserver;

function loadMap() {
  if (mapLoaded) return;
  mapLoaded = true;
  mapObserver?.disconnect();
  import('./explore-app.jsx');
}

if (mapSection) {
  const isNearViewport = mapSection.getBoundingClientRect().top < window.innerHeight + 320;
  if (location.hash === '#map' || isNearViewport) {
    loadMap();
  } else if ('IntersectionObserver' in window) {
    mapObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMap();
    }, { rootMargin: '320px 0px' });
    mapObserver.observe(mapSection);
  } else {
    loadMap();
  }
}

window.addEventListener('hashchange', () => {
  if (location.hash === '#map') loadMap();
});
