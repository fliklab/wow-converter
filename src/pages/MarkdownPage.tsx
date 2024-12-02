import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { loadMarkdownFile, MarkdownContent } from "../utils/markdownLoader";
import MarkdownRenderer from "../components/MarkdownRenderer";

const MarkdownPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<MarkdownContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        setIsLoading(true);
        setError(null);
        const markdownContent = await loadMarkdownFile(
          `/content/posts/${slug}.md`
        );
        setContent(markdownContent);
      } catch (err) {
        setError("콘텐츠를 불러오는데 실패했습니다.");
        console.error("Error loading markdown:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      loadContent();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">콘텐츠를 찾을 수 없습니다</h1>
        <p className="text-gray-600">요청하신 페이지가 존재하지 않습니다.</p>
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
