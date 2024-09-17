import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleRegister = async () => {
        if (password.length < 6) {
            console.error('Password must be at least 6 characters long');
            setError('Password must be at least 6 characters long');
            return;
        }

        if (!email) {
            console.error('Email is required');
            setError('Email is required');
            return;
        }
        
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                email, // Include email in the request
                password
            });
            console.log('Registration success:', response.data);
            navigate('/login'); // Navigate after successful registration
        } catch (error) {
            console.error('Registration error:', error.response.data);
            setError('Registration failed');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <button onClick={handleRegister}>Register</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default RegisterPage;
