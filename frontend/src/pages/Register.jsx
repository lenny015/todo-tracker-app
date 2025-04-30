import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({
        user_name: '',
        user_email: '',
        password: ''
    });

    const [message, setMessage] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        localStorage.removeItem('token');
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        try {
            const result = await fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await result.json();

            if (result.ok) {
                setMessage('Sucessfully registered');
                setSuccess(true);
            } else {
                setMessage(data.detail || "Error registering");
            }
        } catch (err) {
            setMessage("Server error");
            console.error('Login error:', err); //temp
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="user_name"
                    placeholder="Username"
                    value={formData.user_name}
                    onChange={handleChange}
                    required
                />
                <input
                    name="user_email"
                    type="email"
                    placeholder="Email"
                    value={formData.user_email}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Register</button>
            </form>

            {message && <p>{message}</p>}

            {success && (
                <p>
                    <Link to="/login">Go to Login</Link>
                </p>
            )}
        </div>
    );
}