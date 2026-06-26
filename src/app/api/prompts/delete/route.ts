import { NextRequest, NextResponse } from 'next/server';
import { deletePromptLibraryRecord } from '@/lib/sheets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json({ error: '缺少必要欄位 id' }, { status: 400 });
    }

    await deletePromptLibraryRecord(id.trim());

    return NextResponse.json({ success: true, id: id.trim() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '內部伺服器錯誤';
    console.error('[API/prompts/delete] 刪除失敗:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
