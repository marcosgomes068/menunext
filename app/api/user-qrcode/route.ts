import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const { username, forceNewQr } = await request.json();
  if (!username) return NextResponse.json({ qrcode: null });
  const db = await open({
    filename: "./db.sqlite",
    driver: sqlite3.Database,
  });
  await db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, plan TEXT DEFAULT 'free', qrcode TEXT);`);
  let user = await db.get(`SELECT * FROM users WHERE username = ?`, username);

  let qrcode = user?.qrcode || null;
  if (forceNewQr && user) {
    qrcode = randomUUID();
    await db.run(`UPDATE users SET qrcode = ? WHERE id = ?`, qrcode, user.id);
    user.qrcode = qrcode;
  }

  return NextResponse.json({ qrcode });
}
