import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const API = 'http://localhost:8000';

export default function UserProfile() {
    const [followers, setFollowers] = useState(0);
    const [taskHistory, setTaskHistory] = useState([]);
    const [userName, setUsername] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userProfile = await axios.get(`${API}/user/profile`, {
                    headers: {
                        auth: `Bearer ${token}`,
                    },
                });
                setUsername(userProfile.data.user_name);

                const followerCount = await axios.get(`${API}/user/followers`, {
                    headers: {
                        auth: `Bearer ${token}`
                    },
                });
                setFollowers(followerCount.data.follower_count);

                const taskHistory = await axios.get(`${API}/user/task_history`, {
                    headers: {
                        auth: `Bearer ${token}`
                    },
                });
                setTaskHistory(taskHistory.data.task_history);
            } catch (error) {
                console.error('Error fetching user data', error);
            }
        };

        fetchUserData();
    }, [token]);

    const heatmapData = taskHistory.map(item => {
        const date = new Date(item.completed_at);
        
        if (isNaN(date.getTime())) {
            return null;
        }
    
        return {
            date: date,
            count: item.tasks_completed,
        };
    }).filter(item => item !== null);

    return (
        <motion.div
            className="user-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
        >
            <div className="user-layout">
                <div className="sidebar">
                    <h2>{userName}'s Profile</h2>
                    <div className="user-info">
                        <h3>Followers: {followers}</h3>
                    </div>
                </div>

                <div className="main-content">
                    <div className="task-history-section">
                        <h3>Task History</h3>
                        <CalendarHeatmap
                            startDate={new Date('2025-01-01')}
                            endDate={new Date()}
                            values={heatmapData}
                            gutterSize={-6.5}
                            showMonthLabels={false}
                            classForValue={value => {
                                if (!value || value.count === 0) {
                                  return 'color-empty';
                                } else if (value.count < 2) {
                                  return 'color-scale-1';
                                } else if (value.count < 5) {
                                  return 'color-scale-2';
                                } else if (value.count < 10) {
                                  return 'color-scale-3';
                                } else {
                                  return 'color-scale-4';
                                }
                              }}
                            tooltipDataAttrs={value => {
                                if (value?.date) {
                                    return {
                                        'data-tip': `${value.date.toDateString()} - ${value.count} tasks completed`,
                                    };
                                }
                                return {}; 
                            }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}