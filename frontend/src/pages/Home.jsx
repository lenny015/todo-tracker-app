import { Link } from 'react-router-dom';
import { LuBanana } from "react-icons/lu";
import { motion } from 'framer-motion';

export default function Home() {
    return (
        <motion.div className="home-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
        >
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
        </motion.div>
    )
}