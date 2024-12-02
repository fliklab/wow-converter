import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MarkdownPage from "./pages/MarkdownPage";
import Header from "./components/Header";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <main className="pt-[60px]">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/posts/hello-world" replace />}
            />
            <Route path="/posts/:slug" element={<MarkdownPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
