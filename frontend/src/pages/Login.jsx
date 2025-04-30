import { useState } from "react";
import axios from '../api/axios';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('/login', {
                user_name: username,
                password,
            });

            const token = response.data.access_token;
            localStorage.setItem('token', token);
        } catch (err) {
            console.error('Login error:', err); //temp
            setError('Invalid login');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p>{error}</p>}
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}