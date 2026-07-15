import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    // 自动连接到你在 Vercel 创建的 Redis 数据库
    const kv = createClient({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
    });

    const { action, text, date, url, index } = req.body;
    let store = await kv.get('memorial_store');
    if (!store) store = { diaries: [], photos: [] };

    if (action === 'get') {
        return res.status(200).json({ success: true, data: store });
    }

    if (action === 'addDiary') {
        store.diaries.unshift({ text, date });
        await kv.set('memorial_store', store);
        return res.status(200).json({ success: true });
    }

    if (action === 'addPhoto') {
        store.photos.unshift(url);
        await kv.set('memorial_store', store);
        return res.status(200).json({ success: true });
    }

    if (action === 'deleteDiary') {
        store.diaries.splice(index, 1);
        await kv.set('memorial_store', store);
        return res.status(200).json({ success: true });
    }

    if (action === 'deletePhoto') {
        store.photos.splice(index, 1);
        await kv.set('memorial_store', store);
        return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });
}
