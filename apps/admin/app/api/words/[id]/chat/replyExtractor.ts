const ESCAPES: Record<string, string> = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
};

const REPLY_START = /^\s*\{\s*"reply"\s*:\s*"/;

// Pulls the "reply" string out of the proposal JSON while it is being generated, so the editor can
// read the reply before the whole proposal is done. Relies on "reply" being the first key, as it is
// in the schema; if it isn't, nothing is extracted and the reply arrives with the proposal.
export const createReplyExtractor = () => {
  let buffer = '';
  // Index of the next unread reply character, -1 until the reply string starts
  let position = -1;
  let done = false;

  // Takes the next chunk of output and returns the newly decoded reply text
  return (delta: string): string => {
    if (done) return '';
    buffer += delta;

    if (position < 0) {
      const start = REPLY_START.exec(buffer);
      if (!start) return '';
      position = start[0].length;
    }

    let text = '';
    while (position < buffer.length) {
      const char = buffer[position];
      if (char === '"') {
        done = true;
        break;
      }
      if (char !== '\\') {
        text += char;
        position += 1;
        continue;
      }

      // Wait for the rest of an escape sequence that is split across chunks
      const escaped = buffer[position + 1];
      if (escaped === undefined) break;
      if (escaped === 'u') {
        const hex = buffer.slice(position + 2, position + 6);
        if (hex.length < 4) break;
        text += String.fromCharCode(parseInt(hex, 16));
        position += 6;
      } else {
        text += ESCAPES[escaped] ?? escaped;
        position += 2;
      }
    }
    return text;
  };
};
