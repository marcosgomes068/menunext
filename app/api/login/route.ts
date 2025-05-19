import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const db = await open({
    filename: "./db.sqlite", // usar banco persistente
    driver: sqlite3.Database,
  });

  await db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, plan TEXT DEFAULT 'free');`);
  // Garante que a coluna 'qrcode' existe
  try {
    await db.exec(`ALTER TABLE users ADD COLUMN qrcode TEXT;`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }

  // Busca usuário cadastrado
  const user = await db.get(
    `SELECT * FROM users WHERE username = ?`,
    username
  );

  if (user && await import("bcryptjs").then(b => b.default.compare(password, user.password))) {
    // Se não tiver QRCode, gera e salva
    let qr = user.qrcode;
    if (!qr) {
      qr = randomUUID();
      await db.run(`UPDATE users SET qrcode = ? WHERE id = ?`, qr, user.id);
    }
    return NextResponse.json({ success: true, username: user.username, plan: user.plan || "free", qrcode: qr });
  } else {
    return NextResponse.json({ success: false, message: "Usuário ou senha inválidos" }, { status: 401 });
  }
}
