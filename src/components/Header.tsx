import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-white dark:bg-card border-b border-gray-200 dark:border-border shadow-sm z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/"
                  ? "text-primary"
                  : "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
              }`}
            >
              이미지 변환
            </Link>
            <Link
              to="/posts/hello-world"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname.startsWith("/posts")
                  ? "text-primary"
                  : "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
              }`}
            >
              문서
            </Link>
          </nav>
        </div>

        <button
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-card/60 transition-colors"
          onClick={() => {
            // 도움말 기능 구현
            alert("도움말 기능은 추후 구현될 예정입니다.");
          }}
        >
          <span className="text-xl font-semibold">?</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
