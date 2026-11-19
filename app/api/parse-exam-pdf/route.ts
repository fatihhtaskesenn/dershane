import { NextResponse } from "next/server";
import { extractText } from "unpdf";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Lütfen geçerli bir PDF dosyası yükleyin." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const { totalPages, text } = await extractText(new Uint8Array(arrayBuffer), {
      mergePages: false,
    });

    const pages = Array.isArray(text) ? text : [String(text ?? "")];
    const combinedText = pages.join("\n\n");

    return NextResponse.json({
      totalPages,
      pages,
      text: combinedText,
    });
  } catch (error) {
    console.error("PDF parse error:", error);
    return NextResponse.json(
      { error: "PDF dosyası okunamadı. Lütfen metin katmanı içeren bir PDF seçin." },
      { status: 500 }
    );
  }
}
