import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

export const config = {
  api: {
    bodyParser: false,
    // Aumenta o limite do corpo para 10MB
    sizeLimit: '10mb',
  },
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    console.log("[UPLOAD] Iniciando upload...");
    // Converte a stream do request para buffer para o formidable
    const formData = await request.formData?.();
    if (!formData) {
      // Fallback para Node.js puro
      // Importa formidable apenas quando necessário
      const formidable = (await import("formidable")).default;
      const req = (request as any).req || request;
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const form = formidable({ multiples: false, uploadDir: "/tmp", keepExtensions: true });
      // Ajuste para tipagem correta do retorno do formidable
      const parsed = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
        form.parse({ ...req, body: buffer }, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });
      const fields = parsed.fields;
      const files = parsed.files;
      console.log("[UPLOAD] fields:", fields);
      console.log("[UPLOAD] files:", files);
      const username = fields.username as string;
      const produtoId = fields.produtoId as string;
      const file = files.file;
      const fileObj = Array.isArray(file) ? file[0] : file;
      console.log("[UPLOAD] fileObj:", fileObj);
      if (!username || !produtoId || !fileObj) {
        console.error("Dados obrigatórios ausentes", { username, produtoId, fileObj });
        return NextResponse.json({ success: false, message: "Dados obrigatórios ausentes" }, { status: 400 });
      }
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const publicDir = path.join(process.cwd(), "public");
      await fs.mkdir(publicDir, { recursive: true });
      const filename = `${username}_${produtoId}_${Date.now()}_${fileObj.originalFilename}`.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const filepath = path.join(uploadDir, filename);
      console.log("Tentando copiar arquivo:", fileObj.filepath, "para", filepath);
      await fs.copyFile(fileObj.filepath, filepath);
      // Converte a imagem para JPEG
      const outputFilename = filename.replace(/\.[^.]+$/, ".jpg");
      const outputFilepath = path.join(uploadDir, outputFilename);
      console.log("Convertendo para JPEG:", outputFilepath);
      await sharp(fileObj.filepath)
        .jpeg({ quality: 85 })
        .toFile(outputFilepath);
      // Remove o arquivo original temporário
      await fs.unlink(fileObj.filepath);
      // Salva caminho no banco
      const db = await open({ filename: "./db.sqlite", driver: sqlite3.Database });
      try {
        await db.exec(`ALTER TABLE produtos ADD COLUMN imagem TEXT;`);
      } catch (e: any) {
        if (!e.message.includes('duplicate column name')) throw e;
      }
      await db.run(`UPDATE produtos SET imagem = ? WHERE id = ?`, `/uploads/${outputFilename}`, produtoId);
      // LOG para debug
      console.log('Imagem salva:', `/uploads/${outputFilename}`);
      return NextResponse.json({ success: true, url: `/uploads/${outputFilename}` });
    }
    // Se for ambiente edge/browser, retorna erro
    return NextResponse.json({ success: false, message: "Upload não suportado neste ambiente. Use Node.js." }, { status: 500 });
  } catch (err) {
    console.error("Erro no upload:", err);
    return NextResponse.json({ success: false, message: "Erro no upload", error: String(err) }, { status: 500 });
  }
}
