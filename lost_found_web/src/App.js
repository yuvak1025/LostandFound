import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import HomePage from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import EditProfile from './components/EditProfile';
import './App.css';
import MyProfile from './components/myprofile';
import ViewProfile from './components/viewprofile';
const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
};

const PrivateRoute = ({ element: Component }) => {
    return isAuthenticated() ? Component : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Container>
                <Routes>
                    <Route path="/" element={isAuthenticated() ? <Navigate to="/home" /> : <Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/home" element={<PrivateRoute element={<HomePage />} />} />
                    <Route path="/editprofile" element={<PrivateRoute element={<EditProfile />} />} />
                    <Route path="/myprofile" element={<PrivateRoute element={<MyProfile />} />} />
                    <Route path="/profile/:userId" element={<ViewProfile />} />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;
