const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

async function getHebrewData() {
  const today = new Date();
  const [gy, gm, gd] = [
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  ];

  const res = await axios.get(`https://www.hebcal.com/converter`, {
    params: {
      cfg: 'json',
      gy,
      gm,
      gd,
      g2h: 1
    }
  });

  return {
    hebrew_date: res.data.hebrew,
    hebrew_day: res.data.hd,
    hebrew_month: res.data.hm
  };
}

async function getParashaAndEvents() {
  const res = await axios.get(`https://www.hebcal.com/shabbat`, {
    params: {
      cfg: 'json',
      geonameid: 293397  // ירושלים
    }
  });

  const items = res.data.items;
  const parasha = items.find(i => i.category === 'parashat')?.hebrew || 'לא ידוע';
  const holiday = items.find(i => i.category === 'holiday')?.hebrew || null;
  const roshChodesh = items.find(i => i.category === 'roshchodesh')?.hebrew || null;
  const omer = items.find(i => i.category === 'omer')?.hebrew || null;

  return { parasha, holiday, roshChodesh, omer };
}

app.get('/israel-time', async (req, res) => {
  try {
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jerusalem' });

    const hebrew = await getHebrewData();
    const events = await getParashaAndEvents();

    res.json({
      datetime: now,
      timezone: 'Asia/Jerusalem',
      hebrew_date: hebrew.hebrew_date,
      parasha: events.parasha,
      holiday: events.holiday,
      rosh_chodesh: events.roshChodesh,
      omer: events.omer
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`🔥 Israel Time API running on http://localhost:${port}`);
});
