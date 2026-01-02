import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Events from './pages/Events';
import About from './pages/About';
import Committee from './pages/Committee';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/about" element={<About />} />
          <Route path="/commitee" element={<Committee />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
