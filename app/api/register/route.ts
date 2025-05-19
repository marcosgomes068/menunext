import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { username, password, restaurantName } = await request.json();
  if (!username || !password || !restaurantName) {
    return NextResponse.json({ success: false, message: "Usuário, senha e nome do restaurante obrigatórios" }, { status: 400 });
  }
  const db = await open({
    filename: "./db.sqlite", // persistente
    driver: sqlite3.Database,
  });
  await db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, plan TEXT DEFAULT 'free', restaurantName TEXT, primaryColor TEXT DEFAULT '#2563eb', secondaryColor TEXT DEFAULT '#f1f5f9');`);
  // Garante que as colunas existem
  try { await db.exec(`ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free';`); } catch (e: any) { if (!e.message.includes('duplicate column name')) throw e; }
  try { await db.exec(`ALTER TABLE users ADD COLUMN restaurantName TEXT;`); } catch (e: any) { if (!e.message.includes('duplicate column name')) throw e; }
  try { await db.exec(`ALTER TABLE users ADD COLUMN primaryColor TEXT DEFAULT '#2563eb';`); } catch (e: any) { if (!e.message.includes('duplicate column name')) throw e; }
  try { await db.exec(`ALTER TABLE users ADD COLUMN secondaryColor TEXT DEFAULT '#f1f5f9';`); } catch (e: any) { if (!e.message.includes('duplicate column name')) throw e; }
  // Verifica se já existe
  const existing = await db.get(`SELECT * FROM users WHERE username = ?`, username);
  if (existing) {
    return NextResponse.json({ success: false, message: "Usuário já cadastrado" }, { status: 409 });
  }
  const hash = await bcrypt.hash(password, 10);
  await db.run(`INSERT INTO users (username, password, plan, restaurantName) VALUES (?, ?, 'free', ?)`, username, hash, restaurantName);
  return NextResponse.json({ success: true });
}
