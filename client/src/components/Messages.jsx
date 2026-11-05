import { useEffect, useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const apiUrl = (path) => `${import.meta.env.VITE_SH_BE_URI}api/messages${path}`;
const headers = () => ({ Authorization: localStorage.getItem('token') });

function Messages() {
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(apiUrl('/users'), { headers: headers() })
            .then((response) => setUsers(response.data.data || []))
            .catch(() => setError('Unable to load users.'));
    }, []);

    const selectUser = async (user) => {
        setSelected(user);
        setError('');
        try {
            const response = await axios.get(
                apiUrl(`/${encodeURIComponent(user.email)}`),
                { headers: headers() }
            );
            setMessages(response.data.data || []);
        } catch {
            setError('Unable to load messages.');
        }
    };

    const sendMessage = async (event) => {
        event.preventDefault();
        if (!selected || !content.trim()) return;
        try {
            await axios.post(
                apiUrl('/'),
                { receiver_email: selected.email, content },
                { headers: headers() }
            );
            setContent('');
            selectUser(selected);
        } catch {
            setError('Unable to send message.');
        }
    };

    return (
        <main className="container py-4">
            <h1 className="h4">Messages</h1>
            {error && <p className="text-danger">{error}</p>}
            <div className="row g-3">
                <div className="col-md-4">
                    <div className="list-group">
                        {users.map((user) => (
                            <button
                                type="button"
                                className={`list-group-item list-group-item-action ${selected?.email === user.email ? 'active' : ''}`}
                                key={user.email}
                                onClick={() => selectUser(user)}
                            >
                                {user.name || user.email}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="col-md-8">
                    {!selected ? (
                        <p className="text-muted">Select a student to start messaging.</p>
                    ) : (
                        <>
                            <div className="border rounded p-3 mb-3">
                                {messages.length === 0 ? (
                                    <p className="text-muted mb-0">No messages yet.</p>
                                ) : messages.map((message) => (
                                    <p key={message.message_id}>
                                        <strong>{message.sender_email}</strong>: {message.content}
                                    </p>
                                ))}
                            </div>
                            <Form onSubmit={sendMessage} className="d-flex gap-2">
                                <Form.Control
                                    value={content}
                                    onChange={(event) => setContent(event.target.value)}
                                    placeholder="Write a message"
                                />
                                <Button type="submit">Send</Button>
                            </Form>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

export default Messages;
