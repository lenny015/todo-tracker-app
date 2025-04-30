export default function TaskList({ tasks, search, onEditClick, onDeleteClick }) {
    const filteredTasks = tasks.filter(task => 
        task?.title?.toLowerCase().includes(search.toLowerCase())
    );
    if (!filteredTasks.length) return <p>No tasks found</p>;

    return (
        <ul>
            {filteredTasks.map(task => (
                <li key={task.task_id}>
                    <h2>{task.title}</h2>
                    <p>{task.description}</p>
                    <p>Due: {new Date(task.due_date).toLocaleDateString()}</p>
                    <button onClick={() => onEditClick(task)}>Edit</button>
                    <button onClick={() => onDeleteClick(task.task_id)}>Delete</button>
                </li>
            ))}
        </ul>
    );
}