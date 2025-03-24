import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // ✅ Fix: Read JSON body properly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await new Promise<any>((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => resolve(JSON.parse(data)));
      req.on('error', err => reject(err));
    });

    const { fileName } = body;

    if (!fileName) {
      return res.status(400).json({ error: 'File name required' });
    }

    const filePath = path.join(process.cwd(), 'public/uploads', fileName);
    
    if (fs.existsSync(filePath)) {
      await fs.remove(filePath);
      return res.status(200).json({ message: 'File deleted' });
    } else {
      return res.status(404).json({ error: 'File not found' });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete file', details: error });
  }
}
