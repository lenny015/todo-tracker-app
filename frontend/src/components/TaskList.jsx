export default function TaskList({ tasks, search, onEditClick, onDeleteClick }) {
    const filteredTasks = tasks.filter(task => 
        task?.title?.toLowerCase().includes(search.toLowerCase())
    );
    if (!filteredTasks.length) return <p>No tasks found</p>;

    return (
        <ul className="task-list">
            {filteredTasks.map(task => (
                <li className="task-item" key={task.task_id}>
                    <div className="task-details">
                        <h2>{task.title}</h2>
                        <p>Due: {new Date(task.due_date).toLocaleDateString()}</p>
                    </div>

                    <div className="task-description">
                        <p>{task.description}</p>
                    </div>

                    <div className="task-actions">
                        <button onClick={() => onEditClick(task)}>Edit</button>
                        <button onClick={() => onDeleteClick(task.task_id)}>Delete</button>
                    </div>
                </li>
            ))}
        </ul>
    );
}