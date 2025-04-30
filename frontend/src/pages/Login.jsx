import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../api/axios';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, []);

    const handleLogin = async () => {
        try {
            const response = await axios.post('/login', {
                user_name: username,
                password,
            });

            const token = response.data.access_token;
            localStorage.setItem('token', token);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err); //temp
            setError('Invalid login');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Login</h2>
                {error && <p className="login-error">{error}</p>}
                <label>Username</label>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                />
                <label>Password</label>
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    type="password"
                />
                <button onClick={handleLogin} className="login-button">Login</button>
            </div>
        </div>
    );
}