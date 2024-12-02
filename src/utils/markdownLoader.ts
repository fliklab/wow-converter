import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrism from "rehype-prism-plus";
import matter from "gray-matter";

export interface MarkdownContent {
  content: string;
  metadata: {
    title?: string;
    date?: string;
    description?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export async function parseMarkdown(
  markdown: string
): Promise<MarkdownContent> {
  // 프론트매터와 콘텐츠 분리
  const { data: metadata, content: markdownContent } = matter(markdown);

  // 마크다운을 HTML로 변환
  const htmlContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrism)
    .use(rehypeStringify)
    .process(markdownContent);

  return {
    content: String(htmlContent),
    metadata,
  };
}

export async function loadMarkdownFile(path: string): Promise<MarkdownContent> {
  try {
    const response = await fetch(path);
    const markdown = await response.text();
    return parseMarkdown(markdown);
  } catch (error) {
    console.error("Error loading markdown file:", error);
    throw error;
  }
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
