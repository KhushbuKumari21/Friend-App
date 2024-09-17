import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomePage.css'; // Import the CSS file

const HomePage = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [friends, setFriends] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Added loading state

    // Function to search users based on username
    const searchUsers = async (username) => {
        if (!username.trim()) {
            setError('Please enter a username to search');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            if (!token) throw new Error('No token found');

            const response = await axios.get('http://localhost:5000/api/users/search', {
                params: { username },
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsers(response.data);
            setError('');
        } catch (error) {
            console.error('Error searching users:', error);
            setError('Failed to search users');
        }
    };

    // Handler for search button click
    const handleSearch = () => {
        searchUsers(search);
    };

    // Fetch recommendations, friends, and incoming requests
    const fetchRecommendationsAndFriends = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
    
            const recommendationsResponse = await axios.get('http://localhost:5000/api/users/recommendations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendations(recommendationsResponse.data);
    
            const friendsResponse = await axios.get('http://localhost:5000/api/users/friends', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFriends(friendsResponse.data);
    
            const requestsResponse = await axios.get('http://localhost:5000/api/friend-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIncomingRequests(requestsResponse.data);
    
        } catch (error) {
            console.error('Error fetching recommendations and friends:', error.response || error.message);
            setError('Failed to fetch recommendations and friends');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchRecommendationsAndFriends();
    }, []);

    // Function to send friend request
    const sendFriendRequest = async (friendId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await fetch('http://localhost:5000/api/friend-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ friendId })
            });

            if (!response.ok) {
                const responseText = await response.text();
                console.error(`Error sending friend request: ${responseText}`);
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${responseText}`);
            }

            const data = await response.json();
            console.log('Friend request sent:', data);
            return data;
        } catch (error) {
            console.error('Network error sending friend request:', error);
            setError('Failed to send friend request');
        }
    };

    // Function to handle incoming friend request
    const handleRequest = async (requestId, action) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await fetch(`http://localhost:5000/api/friend-request/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ requestId })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`Request ${action}d:`, data);
                setIncomingRequests(prev => prev.filter(request => request._id !== requestId));
                fetchRecommendationsAndFriends(); // Refresh data
            } else {
                const responseText = await response.text();
                console.error(`Error ${action}ing request: ${responseText}`);
                setError(`Failed to ${action} request`);
            }
        } catch (error) {
            console.error(`Network error ${action}ing request:`, error);
            setError(`Failed to ${action} request`);
        }
    };

    // Function to unfriend a user
    const handleUnfriend = async (friendId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await fetch(`http://localhost:5000/api/friend/${friendId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Unfriended:', data);
                setFriends(prev => prev.filter(friend => friend._id !== friendId));
            } else {
                const responseText = await response.text();
                console.error('Error unfriending:', responseText);
                setError('Failed to unfriend');
            }
        } catch (error) {
            console.error('Network error unfriending:', error);
            setError('Failed to unfriend');
        }
    };

    return (
        <div className="home-container">
            <div className="input-group">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search users..."
                />
                <button onClick={handleSearch} disabled={!search.trim()}>Search</button>
            </div>

            {loading && <p className="loading">Loading...</p>}

            {error && <p className="error">{error}</p>}

            <h2>Search Results</h2>
            {users.length > 0 ? users.map(user => (
                <div key={user._id} className="user-item">
                    <p>{user.username}</p>
                    <button onClick={() => sendFriendRequest(user._id)}>Send Friend Request</button>
                </div>
            )) : <p>No users found.</p>}

            <h2>Friend Recommendations</h2>
            {recommendations.length > 0 ? recommendations.map(user => (
                <div key={user._id} className="user-item">
                    <p>{user.username}</p>
                    <button onClick={() => sendFriendRequest(user._id)}>Send Friend Request</button>
                </div>
            )) : <p>No recommendations available.</p>}

            <h2>Friends List</h2>
            {friends.length > 0 ? friends.map(friend => (
                <div key={friend._id} className="user-item">
                    <p>{friend.username}</p>
                    <button onClick={() => handleUnfriend(friend._id)}>Unfriend</button>
                </div>
            )) : <p>No friends found.</p>}

            <h2>Incoming Friend Requests</h2>
            {incomingRequests.length > 0 ? incomingRequests.map(request => (
                <div key={request._id} className="user-item">
                    <p>{request.username}</p>
                    <button onClick={() => handleRequest(request._id, 'accept')}>Accept</button>
                    <button onClick={() => handleRequest(request._id, 'reject')}>Reject</button>
                </div>
            )) : <p>No incoming requests.</p>}
        </div>
    );
};

export default HomePage;
