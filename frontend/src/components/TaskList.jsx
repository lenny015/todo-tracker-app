export default function TaskList({ tasks, search, onEditClick }) {
    const filteredTasks = tasks.filter(task => 
        task?.title?.toLowerCase().includes(search.toLowerCase())
    );
    if (!filteredTasks.length) return <p>No tasks found</p>;

    return (
        <ul>
            {filteredTasks.map(task => (
                task?.title ? (
                    <li key={task.task_id}>
                        <h2>{task.title}</h2>
                        <p>{task.description}</p>
                        <p>Due: {new Date(task.due_date).toLocaleDateString()}</p>
                        <button onClick={() => onEditClick(task)}>Edit</button>
                    </li>
                ) : (
                    <p key="invalid-task">Task data incomplete</p>
                )
                
            ))}
        </ul>
    );
}