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
      className={`prose prose-lg dark:prose-invert max-w-none ${className}`}
    >
      {content.metadata.title && (
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{content.metadata.title}</h1>
          {content.metadata.date && (
            <time className="text-gray-500 dark:text-gray-400">
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
                  className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full"
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
