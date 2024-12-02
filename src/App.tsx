import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MarkdownPage from "./pages/MarkdownPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/posts/:slug" element={<MarkdownPage />} />
      </Routes>
    </Router>
  );
};

export default App;
