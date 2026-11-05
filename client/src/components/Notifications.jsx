import { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Loader from './Loader';

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_SH_BE_URI}api/notifications/`,
                { headers: { Authorization: localStorage.getItem('token') } }
            );
            setNotifications(response.data.data || []);
        } catch (requestError) {
            setError(
                requestError.response?.data?.detail ||
                'Unable to load notifications.'
            );
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_SH_BE_URI}api/notifications/${notificationId}/read`,
                {},
                { headers: { Authorization: localStorage.getItem('token') } }
            );
            setNotifications((current) => current.map((notification) =>
                notification.notification_id === notificationId
                    ? { ...notification, read: true }
                    : notification
            ));
        } catch (requestError) {
            setError(
                requestError.response?.data?.detail ||
                'Unable to mark notification as read.'
            );
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (loading) return <Loader />;

    return (
        <main className="container py-4" style={{ maxWidth: '720px' }}>
            <h1 className="h4 mb-3">Notifications</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {notifications.length === 0 ? (
                <p className="text-muted">No notifications yet.</p>
            ) : (
                <div className="list-group">
                    {notifications.map((notification) => (
                        <div
                            key={notification.notification_id}
                            className={`list-group-item ${notification.read ? '' : 'list-group-item-primary'}`}
                        >
                            <div className="d-flex justify-content-between align-items-start gap-3">
                                <span>
                                    {notification.text}{' '}
                                    <Badge bg={notification.read ? 'secondary' : 'primary'}>
                                        {notification.read ? 'Read' : 'Unread'}
                                    </Badge>
                                </span>
                                {!notification.read && (
                                    <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() => markAsRead(notification.notification_id)}
                                    >
                                        Mark as read
                                    </Button>
                                )}
                            </div>
                            <small className="text-muted">
                                {new Date(notification.created_at).toLocaleString()}
                            </small>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default Notifications;
