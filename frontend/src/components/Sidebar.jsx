export default function Sidebar({ onCreateClick, onLogout }) {
    return(
        <div className="sidebar">
            <h2>Dashboard</h2>
            <button onClick={onCreateClick}>+ Create Task</button>
            <div className="logout-container">
                <button className="logout-button" onClick={onLogout}>Logout</button>
            </div>
        </div>
    );
}