import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public/uploads');

  try {
    await fs.ensureDir(uploadDir); // Ensure upload directory exists
    const files = await fs.readdir(uploadDir);

    const fileList = files.map(file => ({
        name: file,
        url: `/api/fileStream/${file}`, // Keep full file name
      }));

    return res.status(200).json(fileList);
  } catch (error) {
    console.error('Error reading files:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
