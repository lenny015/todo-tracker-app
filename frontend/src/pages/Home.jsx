import { Link } from 'react-router-dom';
import { LuBanana } from "react-icons/lu";

export default function Home() {
    return (
        <div className="home-container">
            <div className="banana-icon-container">
                <LuBanana size={50} />
            </div>
            <h1 className='home-title'>MonkeyDo</h1>
            <h3>A To-Do List App</h3>
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