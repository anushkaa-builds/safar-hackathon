require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// 1. Essential Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// 2. Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

// Hotelbeds Configurations
const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY;
const HOTELBEDS_SECRET = process.env.HOTELBEDS_API_SECRET;
const HOTELBEDS_BASE_URL = 'https://api.test.hotelbeds.com';

function getHotelbedsSignature() {
  const timestamp = Math.floor(Date.now() / 1000);
  const stringToSign = HOTELBEDS_API_KEY + HOTELBEDS_SECRET + timestamp;
  return crypto.createHash('sha256').update(stringToSign).digest('hex');
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

/**
 * Health Check Route
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Save & Verify OpenAI API Key Handler
 */
async function handleSaveKey(req, res) {
  try {
    const apiKey = req.body?.apiKey || req.body?.key || req.body?.openaiApiKey;

    // 1. Validate Input
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'API key is required and must be a non-empty string' 
      });
    }

    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');

    // 2. Test Key Validity against OpenAI API
    try {
      await axios.get('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${cleanKey}`,
        },
        timeout: 10000,
      });
    } catch (openAiErr) {
      const statusCode = openAiErr.response?.status || 401;
      const errorMessage = openAiErr.response?.data?.error?.message || 'Invalid OpenAI API key provided.';
      
      return res.status(statusCode === 401 ? 401 : 400).json({ 
        success: false, 
        error: `OpenAI verification failed: ${errorMessage}` 
      });
    }

    // 3. Check Supabase Configuration
    if (!supabase) {
      return res.status(500).json({ 
        success: false, 
        error: 'Supabase client is not configured on the server. Check SUPABASE_URL and SUPABASE_SERVICE_KEY.' 
      });
    }

    // 4. Upsert key into Supabase 'api_keys' table
    const { error: dbError } = await supabase
      .from('api_keys')
      .upsert(
        {
          provider: 'openai',
          key: cleanKey,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'provider' }
      );

    if (dbError) {
      console.error('[Supabase Error]:', dbError);
      return res.status(500).json({ 
        success: false, 
        error: `Database error: ${dbError.message}` 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'OpenAI API key verified and saved successfully' 
    });

  } catch (err) {
    console.error('[Server Error /api/save-key]:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'An unexpected internal server error occurred' 
    });
  }
}

// POST /api/save-key (and convenient aliases)
app.post('/api/save-key', handleSaveKey);
app.post('/api/config/key', handleSaveKey);
app.post('/api/save-openai-key', handleSaveKey);

/**
 * Hotelbeds Search Route
 * GET /api/hotels/search
 */
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

// -------------------------------------------------------------
// JSON CATCH-ALL 404 & ERROR HANDLER
// -------------------------------------------------------------

// Catch-all for unmatched routes to prevent HTML 404s
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized JSON error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// -------------------------------------------------------------
// LOCAL DEV VS VERCEL EXPORT
// -------------------------------------------------------------

// Run app.listen ONLY during local execution (`node index.js`)
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Safar backend running locally on http://localhost:${PORT}`);
  });
}

// Export the Express app for Vercel Serverless Functions
module.exports = app;