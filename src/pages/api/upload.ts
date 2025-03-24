import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';
import { nanoid } from 'nanoid';

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser for file uploads
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Read file from request
    const data = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      return res.status(400).json({ error: 'Invalid form data' });
    }

    const fileMatch = data.toString().match(/filename="(.+)"/);
    if (!fileMatch) {
      return res.status(400).json({ error: 'No file detected' });
    }

    const originalFileName = fileMatch[1].trim();
    const fileExt = path.extname(originalFileName);
    const uniqueId = nanoid(10); // Generate a short ID
    const newFileName = `${uniqueId}${fileExt}`;
    const fileData = data.slice(data.indexOf('\r\n\r\n') + 4, -2);

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await fs.ensureDir(uploadDir);

    // Save file
    const filePath = path.join(uploadDir, newFileName);
    await fs.writeFile(filePath, fileData);

    // Generate Short URL
    const fileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/fileStream/${uniqueId}`;

    return res.status(200).json({ message: 'File uploaded', url: fileUrl });
  } catch (error) {
    return res.status(500).json({ error: 'File upload failed', details: error });
  }
}
