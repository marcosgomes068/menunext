import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function GET() {
  const db = await open({
    filename: "./db.sqlite",
    driver: sqlite3.Database,
  });
  await db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, plan TEXT DEFAULT 'free', restaurantName TEXT);`);
  await db.exec(`CREATE TABLE IF NOT EXISTS adm (id INTEGER PRIMARY KEY, username TEXT, password TEXT, plan TEXT, restaurantName TEXT, primaryColor TEXT, secondaryColor TEXT, whatsapp TEXT, msgWhatsapp TEXT);`);
  // Garante que as colunas 'plan' e 'restaurantName' existem
  try {
    await db.exec(`ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free';`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  try {
    await db.exec(`ALTER TABLE users ADD COLUMN restaurantName TEXT;`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  // Adiciona as colunas de cor se não existirem
  try {
    await db.exec(`ALTER TABLE users ADD COLUMN primaryColor TEXT DEFAULT '#2563eb';`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  try {
    await db.exec(`ALTER TABLE users ADD COLUMN secondaryColor TEXT DEFAULT '#f1f5f9';`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  const users = await db.all(`SELECT id, username, COALESCE(plan, 'free') as plan, restaurantName, primaryColor, secondaryColor FROM users`);
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const { id, plan } = await request.json();
  if (!id || !plan) {
    return NextResponse.json({ success: false, message: "Dados inválidos" }, { status: 400 });
  }
  const db = await open({
    filename: "./db.sqlite",
    driver: sqlite3.Database,
  });
  await db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, plan TEXT DEFAULT 'free', restaurantName TEXT);`);
  await db.exec(`CREATE TABLE IF NOT EXISTS adm (id INTEGER PRIMARY KEY, username TEXT, password TEXT, plan TEXT, restaurantName TEXT, primaryColor TEXT, secondaryColor TEXT, whatsapp TEXT, msgWhatsapp TEXT);`);
  // Garante que as colunas 'plan' e 'restaurantName' existem
  try {
    await db.exec(`ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free';`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  try {
    await db.exec(`ALTER TABLE users ADD COLUMN restaurantName TEXT;`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  // Atualiza ou cria o campo plan
  await db.run(`UPDATE users SET plan = ? WHERE id = ?`, plan, id);
  // Se não atualizou (usuário não tinha coluna), faz um update forçado
  const user = await db.get(`SELECT * FROM users WHERE id = ?`, id);
  if (!user.plan) {
    await db.run(`UPDATE users SET plan = ? WHERE id = ?`, plan, id);
  }
  return NextResponse.json({ success: true });
}

// PUT para atualizar nome/cores do restaurante
export async function PUT(request: Request) {
  const { username, restaurantName, primaryColor, secondaryColor, configOnly } = await request.json();
  if (!username) return NextResponse.json({ success: false, message: "Usuário obrigatório" }, { status: 400 });
  const db = await open({ filename: "./db.sqlite", driver: sqlite3.Database });
  // Garante as colunas
  try { await db.exec(`ALTER TABLE users ADD COLUMN primaryColor TEXT DEFAULT '#2563eb';`); } catch (e: any) { if (!e.message.includes('duplicate column name')) throw e; }
  try { await db.exec(`ALTER TABLE users ADD COLUMN secondaryColor TEXT DEFAULT '#f1f5f9';`); } catch (e: any) { if (!e.message.includes('duplicate column name')) throw e; }
  if (restaurantName) {
    await db.run(`UPDATE users SET restaurantName = ? WHERE username = ?`, restaurantName, username);
  }
  if (primaryColor) {
    await db.run(`UPDATE users SET primaryColor = ? WHERE username = ?`, primaryColor, username);
  }
  if (secondaryColor) {
    await db.run(`UPDATE users SET secondaryColor = ? WHERE username = ?`, secondaryColor, username);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ success: false, message: "ID obrigatório" }, { status: 400 });
  const db = await open({
    filename: "./db.sqlite",
    driver: sqlite3.Database,
  });
  await db.run(`DELETE FROM users WHERE id = ?`, id);
  return NextResponse.json({ success: true });
}

// Atualiza as configurações do restaurante
export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.username) return NextResponse.json({ success: false, message: "Usuário obrigatório" }, { status: 400 });
  const db = await open({ filename: "./db.sqlite", driver: sqlite3.Database });
  // Garante que as colunas existem
  try {
    await db.exec(`ALTER TABLE adm ADD COLUMN restaurantName TEXT;`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  try {
    await db.exec(`ALTER TABLE adm ADD COLUMN primaryColor TEXT DEFAULT '#2563eb';`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  try {
    await db.exec(`ALTER TABLE adm ADD COLUMN secondaryColor TEXT DEFAULT '#f1f5f9';`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  // Atualiza os dados
  await db.run(
    `UPDATE adm SET restaurantName = ?, primaryColor = ?, secondaryColor = ? WHERE username = ?`,
    body.restaurantName,
    body.primaryColor,
    body.secondaryColor,
    body.username
  );
  if (body.configOnly) {
    await db.run(
      `UPDATE adm SET restaurantName = ?, primaryColor = ?, secondaryColor = ?, whatsapp = ?, msgWhatsapp = ? WHERE username = ?`,
      body.restaurantName,
      body.primaryColor,
      body.secondaryColor,
      body.whatsapp,
      body.msgWhatsapp,
      body.username
    );
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: true });
}
