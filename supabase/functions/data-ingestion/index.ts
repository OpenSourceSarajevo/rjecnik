import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]*/g)
  if (!matches) {
    return [text.trim()]
  }
  return matches.map(s => s.trim()).filter(Boolean)
}

function extractWords(sentence: string): string[] {
  return sentence.toLowerCase().match(/\b[\p{L}\p{M}\p{N}']+\b/gu) || []
}

function buildWordMap(sentences: string[]) {
  const wordMap: Record<string, { count: number; examples: Set<string> }> = {}

  for (const sentence of sentences) {
    const words = extractWords(sentence)
    for (const word of words) {
      if (!wordMap[word]) {
        wordMap[word] = { count: 0, examples: new Set() }
      }
      wordMap[word].count++
      wordMap[word].examples.add(sentence)
    }
  }

  return wordMap
}

function toResultArray(
  wordMap: Record<string, { count: number; examples: Set<string> }>,
  existingSet: Set<string>
) {
  return Object.entries(wordMap).map(([word, { count, examples }]) => ({
    word,
    count,
    examples: Array.from(examples),
    new: !existingSet.has(word),
  }))
}

async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  )

  const { text, source, url, user_email } = await req.json()

  if (!text) {
    return new Response(JSON.stringify({ error: "Missing 'text' field" }), { status: 400 })
  }

  if (!source) {
    return new Response(JSON.stringify({ error: "Missing 'source' field" }), { status: 400 })
  }

  if (!user_email) {
    return new Response(JSON.stringify({ error: "Missing 'user_email' field" }), { status: 400 })
  }

  const textHash = await hashText(text)

  const { data: existing, error: dupCheckError } = await supabase
    .from("ingestion_log")
    .select("id")
    .eq("text_hash", textHash)
 
  if (dupCheckError) {
    return new Response(JSON.stringify({ error: dupCheckError.message }), { status: 500 })
  }

  if (existing && existing.length > 0) {
    return new Response(JSON.stringify({ error: "Duplicate text already ingested" }), { status: 409 })
  }

  const sentences = splitIntoSentences(text)
  const wordMap = buildWordMap(sentences)
  const wordList = Object.keys(wordMap)

  const { data: existingWords, wordFetchError } = await supabase
    .from("words_v2")
    .select("headword")
    .in("headword", wordList)

  if (wordFetchError) {
    return new Response(JSON.stringify({ error: wordFetchError.message }), { status: 500 })
  }
 
  const existingSet = new Set((existingWords || []).map(row => row.headword))  
  const result = toResultArray(wordMap, existingSet)

  const { data: existingInNew, error: fetchNewError } = await supabase
    .from("words_new")
    .select("headword, count, examples, is_new")
    .in("headword", wordList)

  if (fetchNewError) {
    return new Response(JSON.stringify({ error: fetchNewError.message }), { status: 500 })
  }

  const newWordMap = new Map(
    (existingInNew || []).map(w => [w.headword, { count: w.count, examples: w.examples }])
  )

  const toInsert = []
  const toUpdate = []

  for (const w of result) {
    const existing = newWordMap.get(w.word)
    if (existing) {
      const mergedExamples = Array.from(new Set([...existing.examples, ...w.examples]))
      toUpdate.push({
        headword: w.word,
        count: w.count + existing.count,
        examples: mergedExamples,
        is_new: existing.is_new 
      })
    } else {
      toInsert.push({
        headword: w.word,
        examples: w.examples,
        count: w.count,
        is_new: w.new
      })
    }
  }
  
  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from("words_new").insert(toInsert)
    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
    }
  }

  for (const word of toUpdate) {
    const { error: updateError } = await supabase
      .from("words_new")
      .update({ count: word.count, examples: word.examples })
      .eq("headword", word.headword)

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 })
    }
  }

  const { data: logEntry, error: logError } = await supabase
    .from("ingestion_log")
    .insert([{
        source: source || null,
        url: url || null,
        text_hash: textHash,
        user_email: user_email,
        word_count: result.length,
        new_word_count: result.filter(w => w.new).length,
        sentence_count: sentences.length
      }
    ])
    .select()
    .single()
    
  if (logError) {
    return new Response(JSON.stringify({ error: logError.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify(logEntry),
    { headers: { "Content-Type": "application/json" } },
  )
})

