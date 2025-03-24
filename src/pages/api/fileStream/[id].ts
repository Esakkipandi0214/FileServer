import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Ensure parameter name matches the file name `[id].ts`
  
  console.log('Requested file ID:', id); // Debugging log

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid file name' });
  }

  const filePath = path.join(process.cwd(), 'public/uploads', id);
  console.log('Resolved file path:', filePath); // Debugging log

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.setHeader('Content-Type', 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}
