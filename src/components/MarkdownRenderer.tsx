import React from "react";
import { MarkdownContent } from "../utils/markdownLoader";

export {};

interface MarkdownRendererProps {
  content: MarkdownContent;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  return (
    <article
      className={`prose prose-lg dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-800 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-gray-900 dark:prose-code:text-gray-100 prose-pre:bg-gray-800 dark:prose-pre:bg-gray-900 max-w-none ${className}`}
    >
      {content.metadata.title && (
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            {content.metadata.title}
          </h1>
          {content.metadata.date && (
            <time className="text-gray-600 dark:text-gray-400">
              {new Date(content.metadata.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          {content.metadata.tags && content.metadata.tags.length > 0 && (
            <div className="flex gap-2 mt-2">
              {content.metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
      )}
      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: content.content }}
      />
    </article>
  );
};

export default MarkdownRenderer;
