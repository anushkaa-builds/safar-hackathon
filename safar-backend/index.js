require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
//const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY;
const HOTELBEDS_SECRET = process.env.HOTELBEDS_API_SECRET;
const HOTELBEDS_BASE_URL = 'https://api.test.hotelbeds.com';

function getHotelbedsSignature() {
  const timestamp = Math.floor(Date.now() / 1000);
  const stringToSign = HOTELBEDS_API_KEY + HOTELBEDS_SECRET + timestamp;
  return crypto.createHash('sha256').update(stringToSign).digest('hex');
}

app.get('/api/hotels/search', async (req, res) => {
  try {
    const { destinationCode, checkIn, checkOut } = req.query;
    const signature = getHotelbedsSignature();

    const result = await axios.post(
      `${HOTELBEDS_BASE_URL}/hotel-api/1.0/hotels`,
      {
        stay: { checkIn, checkOut },
        occupancies: [{ rooms: 1, adults: 2, children: 0 }],
        destination: { code: destinationCode },
      },
      {
        headers: {
          'Api-key': HOTELBEDS_API_KEY,
          'X-Signature': signature,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(result.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Hotel search failed' });
  }
});

app.listen(4000, () => console.log('Safar backend running on http://localhost:4000'));