import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Careers from "@/pages/Careers";
import Resources from "@/pages/Resources";
import Contact from "@/pages/Contact";
import AIExperience from "@/pages/AIExperience";
import ModeToggle from "@/components/ModeToggle";
import { ModeProvider } from "@/lib/ModeContext";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ModeProvider>
          <Toaster position="top-center" richColors />
          <ModeToggle />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
            <Route path="/ai" element={<AIExperience />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </ModeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
