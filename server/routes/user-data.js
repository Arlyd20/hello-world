import { Router } from 'express';
import {
  addFavorite,
  createItinerary,
  deleteFavorite,
  getFavorites,
  getItineraries
} from '../controllers/user-data.js';

const router = Router();

router.get('/favorites', getFavorites);
router.post('/favorites', addFavorite);
router.delete('/favorites/:id', deleteFavorite);
router.get('/itineraries', getItineraries);
router.post('/itineraries', createItinerary);

export default router;
