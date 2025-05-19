import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { writeFileSync } from "fs";
import path from "path";
import { parse } from "json2csv";

export async function GET() {
  const db = await open({
    filename: "./db.sqlite",
    driver: sqlite3.Database,
  });
  await db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, plan TEXT DEFAULT 'free');`);
  const users = await db.all(`SELECT id, username, plan FROM users`);

  // Gera CSV
  const csv = parse(users, { fields: ["id", "username", "plan"] });
  const filePath = path.join(process.cwd(), "usuarios.csv");
  writeFileSync(filePath, csv, "utf8");

  return NextResponse.json({ success: true, file: "/usuarios.csv" });
}
