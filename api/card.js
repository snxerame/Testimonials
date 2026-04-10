import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const CARDS_KEY = 'wingies_cards';

  try {
    // GET - Fetch all cards
    if (req.method === 'GET') {
      const cards = await kv.get(CARDS_KEY) || [];
      return res.status(200).json({ cards });
    }

    // POST - Add a new card
    if (req.method === 'POST') {
      const { name, link } = req.body;

      if (!name || !link) {
        return res.status(400).json({ error: 'Name and link are required' });
      }

      const cards = await kv.get(CARDS_KEY) || [];
      const newCard = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name,
        link,
        createdAt: new Date().toISOString()
      };

      cards.push(newCard);
      await kv.set(CARDS_KEY, cards);

      return res.status(200).json({ cards });
    }

    // DELETE - Remove a card
    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Card ID is required' });
      }

      const cards = await kv.get(CARDS_KEY) || [];
      const filteredCards = cards.filter(card => card.id !== id);

      await kv.set(CARDS_KEY, filteredCards);

      return res.status(200).json({ cards: filteredCards });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
