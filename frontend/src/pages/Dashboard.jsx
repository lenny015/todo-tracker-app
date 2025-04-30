import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import TaskEditMenu from '../components/TaskEditMenu';
import TaskCreateMenu from '../components/TaskCreateMenu';
import TaskList from '../components/TaskList';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const API = 'http://localhost:8000';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [search, setSearch] = useState('');
    const [editTask , setEditTask] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', due_date: '' });
    const [showEdit, setShowEdit] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ title: '', description: '', due_date: '' });

    const token = localStorage.getItem('token');
    const navigate = useNavigate();

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

                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/');
                }

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

    const openCreate = () => {
        setCreateForm({ title: '', description: '', due_date: '' });
        setShowCreate(true);
      };
    
      const closeCreate = () => {
        setShowCreate(false);
      };
    
      const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
          const result = await axios.post(`${API}/tasks`, createForm, {
            headers: {
              auth: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (result.data?.task) {
            const newTask = result.data.task;
            setTasks(prevTasks => [...prevTasks, newTask]);
            closeCreate();
          } else {
            console.error("Created task does not have valid title or other data", result.data);
          }
        } catch (error) {
          console.error("Failed to create task", error.message);
        }
      };

      const handleDelete = async (taskId) => {
        try {
            await axios.delete(`${API}/tasks/${taskId}`, {
                headers: {
                    auth: `Bearer ${token}`,
                },
            });

            setTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
        } catch (error) {
            console.error("Failed to delete task", error);
        }
      };

      const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
      };

      const markTaskComplete = async (taskId) => {
        try {
            const result = await axios.post(`${API}/tasks/${taskId}/complete`, {}, {
                headers: {
                    auth: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
            toast.success("Task marked as complete!");
        } catch (error) {
            console.error('Failed to mark task as complete', error.message);
            toast.error("Failed to mark task as complete.");
        }
      } 

    return (
        <div className='dashboard'>
            <Sidebar onCreateClick={openCreate} onLogout={handleLogout} />
            <div className='task-section'>
                <input
                    type="text"
                    className="task-search"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    />
                <TaskList 
                    tasks={filteredTasks}
                    search={search}
                    onEditClick={openEdit}
                    onDeleteClick={handleDelete}
                    markTaskComplete={markTaskComplete} />
            </div>
            {showEdit && (
                <TaskEditMenu
                    form={editForm}
                    setForm={setEditForm}
                    onClose={closeEdit}
                    onSubmit={handleEditSubmit}
                />
            )}

            {showCreate && (
                <TaskCreateMenu
                    form={createForm}
                    setForm={setCreateForm}
                    onClose={closeCreate}
                    onSubmit={handleCreateSubmit}
                />
            )}
        <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
}
