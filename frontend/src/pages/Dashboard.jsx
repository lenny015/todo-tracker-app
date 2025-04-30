import { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [search, setSearch] = useState('');
    const [editTask , setEditTask] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', due_date: '' });
    const [showEdit, setShowEdit] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const result = await axios.get(`${API}/tasks?status=pending`, {
                    headers: {
                        auth: `Bearer ${token}`,
                    },
                });
                setTasks(result.data);
                setFilteredTasks(result.data);
            } catch (error) {
                console.error("Failed to fetch tasks: ", error.message);
            }
        };

        fetchTasks();
    }, [token]);

    useEffect(() => {
        const results = tasks.filter(task => task.title.toLowerCase().includes(search.toLowerCase()));
        setFilteredTasks(results);
    }, [search, tasks]);

    const openEdit = (task) => {
        setEditTask(task);
        setEditForm({
            title: task.title,
            description: task.description,
            due_date: task.due_date ? task.due_date.split("T")[0] : '',
        });
        setShowEdit(true);
    };

    const closeEdit = () => {
        setShowEdit(false);
        setEditTask(null);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API}/tasks/${editTask.task_id}`, editForm, {
                headers: {
                    auth: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const updatedTasks = tasks.map(t => t.task_id === editTask.task_id ? { ...t, ...editForm } : t);

            setTasks(updatedTasks);
            closeEdit();
        } catch (error) {
            console.error("Failed to update task", error.message);
        }
    };

    return (
        <div>
            <h1>Dashboard</h1>

            <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <ul>
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <li key={task.task_id}>
                            <h2>{task.title}</h2>
                            <p>{task.description}</p>
                            <p>Due: {new Date(task.due_date).toLocaleDateString()}</p>
                            <button onClick={() => openEdit(task)}>Edit</button>
                        </li>
                    ))
                    ) : (
                    <p>No tasks found.</p>
                    )}
            </ul>

            {showEdit && (
                <div>
                    <form onSubmit={handleEditSubmit}>
                        <h2>Edit Task</h2>
                        <label>Title</label>
                        <input 
                            type="text"
                            value={editForm.title}
                            onChange={e => setEditForm({...editForm, title:e.target.value})}
                        />
                        <label>Description</label>
                        <textarea
                            value={editForm.description}
                            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                        />
                        <label>Due Date</label>
                        <input
                            type="date"
                            value={editForm.due_date}
                            onChange={e => setEditForm({ ...editForm, due_date: e.target.value })}
                        />

                        <button type="button" onClick={closeEdit}>Cancel</button>
                        <button type="submit">Save</button>
                    </form>
                </div>
            )}
      
        </div>
    )
}
