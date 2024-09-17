import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './TaskForm';
import TaskEditForm from './TaskEditForm'; // Import TaskEditForm if you are using it
import './Dashboard.css';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null); // State for handling editing

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskDelete = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskEdit = (task) => {
    setEditingTask(task); // Set the task to be edited
  };

  const handleTaskUpdate = async (task) => {
    try {
      await axios.put(`/api/tasks/${task._id}`, task);
      fetchTasks(); // Refresh tasks after update
      setEditingTask(null); // Clear editing state
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <TaskForm refreshTasks={fetchTasks} />
      {editingTask && (
        <TaskEditForm task={editingTask} onUpdate={handleTaskUpdate} />
      )}
      {loading ? <p>Loading...</p> : (
        <ul>
          {tasks.map(task => (
            <li key={task._id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Due Date: {task.dueDate}</p>
              <p>Status: {task.status}</p>
              <button onClick={() => handleTaskEdit(task)}>Edit</button>
              <button onClick={() => handleTaskDelete(task._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
