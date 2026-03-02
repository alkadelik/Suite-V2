/**
 * Converts HTML content to Markdown format
 * Supports: bold, italic, underline, bullet lists, numbered lists
 */
export function htmlToMarkdown(html: string): string {
  if (!html || html === "<p></p>") return ""

  let markdown = html

  // Handle ordered lists first (before unordered to preserve numbering)
  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let counter = 1
    const items = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, item: string) => {
      const cleanItem = item.replace(/<\/?p[^>]*>/gi, "").trim()
      return `${counter++}. ${cleanItem}\n`
    })
    return `\n${items}\n`
  })

  // Handle unordered lists
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    const items = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, item: string) => {
      const cleanItem = item.replace(/<\/?p[^>]*>/gi, "").trim()
      return `- ${cleanItem}\n`
    })
    return `\n${items}\n`
  })

  // Handle bold
  markdown = markdown.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, "**$2**")

  // Handle italic
  markdown = markdown.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, "_$2_")

  // Handle underline - use a custom marker that won't conflict
  markdown = markdown.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, "++$1++")

  // Handle empty paragraphs (blank lines) before regular paragraphs
  markdown = markdown.replace(/<p[^>]*>\s*(<br\s*\/?>)?\s*<\/p>/gi, "\n\n")

  // Handle paragraphs - convert to double newlines
  markdown = markdown.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")

  // Handle line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, "\n")

  // Remove any remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, "")

  // Decode HTML entities
  markdown = markdown
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  // Trim trailing whitespace only
  markdown = markdown.trim()

  return markdown
}

/**
 * Converts Markdown content to HTML format
 * Supports: bold, italic, underline, bullet lists, numbered lists
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return ""

  let html = markdown

  // First, normalize line endings
  html = html.replace(/\r\n/g, "\n")

  // Handle underline (++text++) - do this before other processing
  html = html.replace(/\+\+([^+]+)\+\+/g, "<u>$1</u>")

  // Handle bold (**text** or __text__)
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>")

  // Handle italic (_text_ or *text* - single)
  // Be careful not to match underscores in the middle of words
  html = html.replace(/(?<![a-zA-Z0-9])_([^_]+)_(?![a-zA-Z0-9])/g, "<em>$1</em>")
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")

  // Split by exactly \n\n to preserve multiple blank lines
  const blocks = html.split("\n\n")

  html = blocks
    .map((block) => {
      block = block.trim()

      // Empty block = blank line (from multiple newlines)
      if (!block) return "<p><br></p>"

      // Check if this block is a list
      const lines = block.split("\n")
      const isBulletList = lines.every((line) => /^[-*]\s+/.test(line.trim()) || !line.trim())
      const isNumberedList = lines.every((line) => /^\d+\.\s+/.test(line.trim()) || !line.trim())

      if (isBulletList) {
        const items = lines
          .filter((line) => line.trim())
          .map((line) => {
            const content = line.replace(/^[-*]\s+/, "").trim()
            return `<li>${content}</li>`
          })
          .join("")
        return `<ul>${items}</ul>`
      }

      if (isNumberedList) {
        const items = lines
          .filter((line) => line.trim())
          .map((line) => {
            const content = line.replace(/^\d+\.\s+/, "").trim()
            return `<li>${content}</li>`
          })
          .join("")
        return `<ol>${items}</ol>`
      }

      // Regular paragraph - convert single newlines to <br>
      block = block.replace(/\n/g, "<br>")
      return `<p>${block}</p>`
    })
    .join("")

  return html
}
