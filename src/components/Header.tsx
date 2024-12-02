import React from "react";
import Logo from "./Logo";

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-white dark:bg-card border-b border-gray-200 dark:border-border shadow-sm z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-4">
            {/* 메뉴 아이템들이 이곳에 추가될 예정 */}
          </nav>
        </div>

        {/* 우측 도움말 버튼 */}
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
