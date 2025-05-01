export default function Sidebar({ onCreateClick, onLogout, onProfileClick }) {
    return(
        <div className="sidebar">
            <h2>Dashboard</h2>
            <button onClick={onProfileClick}>Profile</button>
            <button onClick={onCreateClick}>+ Create Task</button>

            <div className="logout-container">
                <button className="logout-button" onClick={onLogout}>Logout</button>
            </div>
        </div>
    );
}