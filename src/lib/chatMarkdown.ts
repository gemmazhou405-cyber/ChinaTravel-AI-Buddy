import { Marked } from 'marked';
import DOMPurify from 'dompurify';

// Buddy replies arrive as markdown. Headings are downgraded to bold paragraphs so
// LLM "###" output cannot shatter the chat bubble rhythm.
const chatMarked = new Marked({
  breaks: true,
  gfm: true,
  renderer: {
    heading({ tokens }) {
      return `<p class="chat-heading">${this.parser.parseInline(tokens)}</p>\n`;
    },
  },
});

export function renderChatMarkdown(text: string): string {
  const html = chatMarked.parse(text, { async: false });
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });
}
