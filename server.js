require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const { RAPIDAPI_KEY, RAPIDAPI_HOST, API_ENDPOINT, API_PARAM, PORT = 3000 } = process.env;

if (!RAPIDAPI_KEY || !RAPIDAPI_HOST || !API_ENDPOINT || !API_PARAM) {
  console.error('Missing values in .env (RAPIDAPI_KEY, RAPIDAPI_HOST, API_ENDPOINT, API_PARAM).');
  process.exit(1);
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/download', async (req, res) => {
  const { url } = req.query;

  if (!url || !/^https?:\/\/([a-z0-9-]+\.)?tiktok\.com\//i.test(url)) {
    return res.status(400).json({ error: 'Please provide a valid TikTok URL.' });
  }

  try {
    const apiUrl = `${API_ENDPOINT}?${API_PARAM}=${encodeURIComponent(url)}`;
    const apiRes = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    const data = await apiRes.json();
    console.log('API status:', apiRes.status);
    console.log('API response:', JSON.stringify(data, null, 2));
    res.status(apiRes.status).json(data);
  } catch (err) {
    console.error('Upstream error:', err);
    res.status(500).json({ error: 'Failed to reach the download API.' });
  }
});

app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));