import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Registration from './pages/Registration';
import About from './pages/About';
import Committee from './pages/Committee';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/register/:id" element={<Registration />} />
          <Route path="/about" element={<About />} />
          <Route path="/commitee" element={<Committee />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
