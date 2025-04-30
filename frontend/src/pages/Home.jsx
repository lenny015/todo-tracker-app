import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="home-container">
            <h1 className='home-title'>Todo Tracker App</h1>
            <div className='home-buttons'>
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