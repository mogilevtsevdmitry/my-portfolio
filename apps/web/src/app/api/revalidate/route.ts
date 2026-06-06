import { timingSafeEqual } from 'crypto';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Constant-time строковое сравнение.
 *
 * timingSafeEqual бросает, если буферы разной длины, поэтому длину сравниваем
 * заранее. Ранний возврат по длине теоретически утекает длину секрета, но это
 * не чувствительная характеристика (длина фиксирована конфигом), а попытка
 * «выровнять» длины сама по себе вносит таймингов больше, чем экономит.
 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  // Контракт сменился: секрет теперь приходит в HTTP-заголовке
  // x-revalidate-secret, а не в query-параметре ?secret= (SEC-007).
  const secret = req.headers.get('x-revalidate-secret');
  const path = req.nextUrl.searchParams.get('path');

  const expected = process.env.REVALIDATION_SECRET;

  // Нет настроенного секрета на сервере или нет/не совпадает присланный —
  // отказываем. Сравнение constant-time.
  if (!expected || !secret || !safeEqual(secret, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  revalidatePath(path);

  return NextResponse.json({ revalidated: true, path, now: Date.now() });
}
