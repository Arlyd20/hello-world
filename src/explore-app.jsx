import React from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './styles/leaflet-map.css';
import DestinationDiscovery from './components/DestinationDiscovery.jsx';

const root = document.getElementById('explore-map-root');
if (root) createRoot(root).render(<DestinationDiscovery />);
