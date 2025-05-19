import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import formidable, { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '10mb', // Permite uploads de até 10MB
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }
  try {
    // Corrige importação do formidable para funcionar no Next.js (ESM/CJS)
    const uploadTmpDir = path.join(process.cwd(), 'public', 'uploads', 'tmp');
    await fs.mkdir(uploadTmpDir, { recursive: true });
    const form = new IncomingForm({ multiples: false, uploadDir: uploadTmpDir, keepExtensions: true });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Erro no formidable:', err);
        return res.status(500).json({ success: false, message: 'Erro no upload', error: String(err) });
      }
      // Garante que username e produtoId sejam strings simples
      const username = Array.isArray(fields.username) ? fields.username[0] : fields.username;
      const produtoId = Array.isArray(fields.produtoId) ? fields.produtoId[0] : fields.produtoId;
      const file = files.file;
      const fileObj = Array.isArray(file) ? file[0] : file;
      if (!username || !produtoId || !fileObj) {
        return res.status(400).json({ success: false, message: 'Dados obrigatórios ausentes' });
      }
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `${username}_${produtoId}_${Date.now()}_${fileObj.originalFilename}`.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const filepath = path.join(uploadDir, filename);
      await fs.copyFile(fileObj.filepath, filepath);
      // Converte a imagem para JPEG
      const outputFilename = filename.replace(/\.[^.]+$/, '.jpg');
      const outputFilepath = path.join(uploadDir, outputFilename);
      await sharp(fileObj.filepath)
        .jpeg({ quality: 85 })
        .toFile(outputFilepath);
      await fs.unlink(fileObj.filepath);
      // Salva caminho no banco
      const db = await open({ filename: './db.sqlite', driver: sqlite3.Database });
      try {
        await db.exec('ALTER TABLE produtos ADD COLUMN imagem TEXT;');
      } catch (e: any) {
        if (!e.message.includes('duplicate column name')) throw e;
      }
      await db.run('UPDATE produtos SET imagem = ? WHERE id = ?', `/uploads/${outputFilename}`, produtoId);
      return res.status(200).json({ success: true, url: `/uploads/${outputFilename}` });
    });
  } catch (err) {
    console.error('Erro no upload:', err);
    return res.status(500).json({ success: false, message: 'Erro no upload', error: String(err) });
  }
}
