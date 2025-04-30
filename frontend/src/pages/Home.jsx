import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div>
            <h1>Todo Tracker App</h1>
            <div>
                <Link to="/login">
                    <button>Login</button>
                </Link>
                <Link to="/register">
                    <button>Register</button>
                </Link>
            </div>
        </div>
    )
}