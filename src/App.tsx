import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MarkdownPage from "./pages/MarkdownPage";
import Header from "./components/Header";
import ImageConverter from "./pages/ImageConverter";

const App: React.FC = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <main className="pt-[60px]">
          <Routes>
            <Route path="/" element={<ImageConverter />} />
            <Route path="/posts/:slug" element={<MarkdownPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
