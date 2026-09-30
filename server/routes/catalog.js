import { Router } from 'express';
import {
  getCities,
  getCity,
  getCountries,
  getCountry,
  getPlace,
  getPlaces,
  searchCatalog
} from '../controllers/catalog.js';

const router = Router();

router.get('/countries', getCountries);
router.get('/countries/:id', getCountry);
router.get('/cities', getCities);
router.get('/cities/:id', getCity);
router.get('/cities/:id/places', getPlaces);
router.get('/places', getPlaces);
router.get('/places/:id', getPlace);
router.get('/search', searchCatalog);

export default router;
