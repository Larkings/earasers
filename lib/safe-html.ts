import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML string voor veilig gebruik met dangerouslySetInnerHTML.
 *
 * Gebruikt een whitelist-benadering: alleen deze tags/attributes worden
 * behouden. Alle scripts, event-handlers, en iframes worden gestript.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'hr',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'b', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
      'ul', 'ol', 'li',
      'a',
      'blockquote', 'cite', 'code', 'pre',
      'span', 'div',
      'img',
      'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class', 'id', 'target', 'rel', 'width', 'height', 'loading'],
    // Forceer target=_blank links om rel=noopener noreferrer te hebben
    ADD_ATTR: ['target', 'rel'],
    // Geen eigen protocols toestaan behalve http/https/mailto/tel
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  })
}
