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
  const { data: metadata, content: markdownContent } = matter(markdown);

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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const markdown = await response.text();

    if (markdown.includes("<!DOCTYPE html>")) {
      throw new Error("마크다운 파일을 찾을 수 없습니다.");
    }

    return parseMarkdown(markdown);
  } catch (error) {
    console.error("마크다운 파일 로딩 오류:", error);
    throw new Error("마크다운 파일을 불러올 수 없습니다.");
  }
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
