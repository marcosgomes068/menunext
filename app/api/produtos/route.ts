import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  if (!username) return NextResponse.json({ produtos: [], categorias: [] });
  const db = await open({ filename: "./db.sqlite", driver: sqlite3.Database });
  // Garante que as tabelas e colunas existem
  await db.exec(`CREATE TABLE IF NOT EXISTS categorias (id INTEGER PRIMARY KEY, username TEXT, nome TEXT);`);
  await db.exec(`CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY, username TEXT, nome TEXT, preco REAL);`);
  // Adiciona coluna categoria_id se não existir
  try {
    await db.exec(`ALTER TABLE produtos ADD COLUMN categoria_id INTEGER;`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  // Adiciona coluna imagem se não existir
  try {
    await db.exec(`ALTER TABLE produtos ADD COLUMN imagem TEXT;`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  const categorias = await db.all(`SELECT id, nome FROM categorias WHERE username = ?`, username);
  const produtos = await db.all(`SELECT id, nome, preco, categoria_id, imagem FROM produtos WHERE username = ?`, username);
  return NextResponse.json({ produtos, categorias });
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = await open({ filename: "./db.sqlite", driver: sqlite3.Database });
  await db.exec(`CREATE TABLE IF NOT EXISTS categorias (id INTEGER PRIMARY KEY, username TEXT, nome TEXT);`);
  await db.exec(`CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY, username TEXT, nome TEXT, preco REAL);`);
  try {
    await db.exec(`ALTER TABLE produtos ADD COLUMN categoria_id INTEGER;`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  // Adiciona coluna imagem se não existir
  try {
    await db.exec(`ALTER TABLE produtos ADD COLUMN imagem TEXT;`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  if (body.categoria) {
    const result = await db.run(`INSERT INTO categorias (username, nome) VALUES (?, ?)`, body.username, body.categoria);
    return NextResponse.json({ success: true, categoria: { id: result.lastID, nome: body.categoria } });
  }
  if (body.nome && body.categoria_id) {
    const result = await db.run(`INSERT INTO produtos (username, nome, preco, categoria_id) VALUES (?, ?, ?, ?)`, body.username, body.nome, body.preco, body.categoria_id);
    return NextResponse.json({ success: true, id: result.lastID });
  }
  return NextResponse.json({ success: false });
}

export async function PUT(request: Request) {
  const { id, nome, preco } = await request.json();
  if (!id || !nome) return NextResponse.json({ success: false });
  const db = await open({ filename: "./db.sqlite", driver: sqlite3.Database });
  try {
    await db.exec(`ALTER TABLE produtos ADD COLUMN categoria_id INTEGER;`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
  await db.run(`UPDATE produtos SET nome = ?, preco = ? WHERE id = ?`, nome, preco, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const db = await open({ filename: "./db.sqlite", driver: sqlite3.Database });
  if (body.categoria_id) {
    // Excluir todos os produtos da categoria antes de excluir a categoria
    await db.run("DELETE FROM produtos WHERE categoria_id = ? AND username = ?", body.categoria_id, body.username);
    await db.run("DELETE FROM categorias WHERE id = ? AND username = ?", body.categoria_id, body.username);
    return NextResponse.json({ success: true });
  }
  if (body.id) {
    await db.run(`DELETE FROM produtos WHERE id = ?`, body.id);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false });
}
