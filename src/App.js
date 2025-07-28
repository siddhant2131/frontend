// App.js
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

import PrivateRoute from './PrivateRoute';
import Chat from './pages/Chat';

function App() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={
          <PrivateRoute>
            <Chat/>
          </PrivateRoute>
        } />
        </Routes>
      </div>
    </>
  );
}

export default App;
