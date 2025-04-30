import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import './App.css'

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/dashboard" replace/>}
        />
        <Route
          path="/register"
          element={!token ? <Register /> : <Navigate to="/dashboard" replace/>}
        />
        <Route
          path="/dashboard"
          element={!token ? <Dashboard /> : <Navigate to="/login" replace/>}
        />
      </Routes>
    </Router>
  )
}

export default App
