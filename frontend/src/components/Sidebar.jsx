export default function Sidebar({ onCreateClick }) {
    return(
        <div>
            <h2>Dashboard</h2>
            <button onClick={onCreateClick}>Create Task</button>
        </div>
    );
}