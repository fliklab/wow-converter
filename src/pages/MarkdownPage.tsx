import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadMarkdownFile, MarkdownContent } from "../utils/markdownLoader";
import MarkdownRenderer from "../components/MarkdownRenderer";

const MarkdownPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<MarkdownContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      if (!slug) {
        navigate("/");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log("Loading markdown file:", `/content/posts/${slug}.md`);
        const markdownContent = await loadMarkdownFile(
          `/content/posts/${slug}.md`
        );
        console.log("Loaded content:", markdownContent);
        setContent(markdownContent);
      } catch (err) {
        console.error("Error loading markdown:", err);
        setError("콘텐츠를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, [slug, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)]">
        <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)]">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          콘텐츠를 찾을 수 없습니다
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          요청하신 페이지가 존재하지 않습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <MarkdownRenderer content={content} />
    </div>
  );
};

export default MarkdownPage;
