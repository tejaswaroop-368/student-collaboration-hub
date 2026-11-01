import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Loader from './Loader';

const getInitials = (text) => {
    if (!text) return '?';
    return text.charAt(0).toUpperCase();
};

const formatTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
};

const CommentSection = ({ postId, autoFocus = false }) => {
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef(null);

    const fetchComments = async (post_id) => {
        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_SH_BE_URI;
            if (!baseUrl) {
                throw new Error('VITE_SH_BE_URI is not configured');
            }
            const url = baseUrl + `api/posts/${post_id}/comments`;
            const response = await axios.get(url, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                    'Content-Type': 'application/json',
                }
            });
            const commentsData = response?.data?.data;
            setComments(Array.isArray(commentsData) ? commentsData : []);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    const addComment = async (e) => {
        e.preventDefault();
        if (!commentInput.trim() || submitting) return;
        setSubmitting(true);
        try {
            const url = import.meta.env.VITE_SH_BE_URI + 'api/comments/create';
            const payload = { post_id: postId, content: commentInput.trim() };
            const response = await axios.post(url, payload, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                    'Content-Type': 'application/json',
                }
            });
            if (response.status === 200) {
                setCommentInput('');
                fetchComments(postId);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (postId) fetchComments(postId);
    }, [postId]);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    return (
        <div className="fb-comment-section">
            {loading ? (
                <div className="text-muted small text-center py-2">Loading comments...</div>
            ) : (
                <div className="fb-comment-list">
                    {comments?.length > 0 ? (
                        comments.map((comment, index) => (
                            <div key={index} className="d-flex gap-2 mb-3">
                                <div className="fb-avatar fb-avatar-sm">
                                    {getInitials(comment.author || comment.created_by)}
                                </div>
                                <div className="flex-grow-1">
                                    <div className="bg-white rounded-3 px-3 py-2 shadow-sm">
                                        <strong className="small d-block">
                                            {comment.author || comment.created_by}
                                        </strong>
                                        <p className="mb-0 small">{comment.content}</p>
                                    </div>
                                    <small className="text-muted ms-2">{formatTime(comment.created_at)}</small>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-muted text-center py-2 small">No comments yet</div>
                    )}
                </div>
            )}

            <Form onSubmit={addComment} className="fb-comment-form">
                <div className="d-flex gap-2 align-items-start">
                    <div className="fb-avatar fb-avatar-sm">
                        <i className="bi bi-person-fill"></i>
                    </div>
                    <div className="flex-grow-1">
                        <Form.Control
                            ref={inputRef}
                            as="textarea"
                            rows={1}
                            placeholder="Write a comment..."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    addComment(e);
                                }
                            }}
                            className="fb-comment-input"
                            disabled={submitting}
                        />
                        <div className="d-flex justify-content-end align-items-center gap-2 mt-2">
                            <small className="text-muted">Press Enter to post</small>
                            <Button
                                type="submit"
                                size="sm"
                                variant="primary"
                                className="rounded-pill px-3 fw-semibold"
                                disabled={submitting || !commentInput.trim()}
                            >
                                {submitting ? 'Posting...' : 'Post'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Form>
        </div>
    );
};

const Home = () => {
    const [loader, setLoader] = useState(false);
    const [posts, setPosts] = useState([]);
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [focusCommentInput, setFocusCommentInput] = useState(false);
    const [createPostModal, setCreatePostModal] = useState(false);
    const isAuthenticated = localStorage.getItem('token') != null;

    const fetchPosts = async () => {
        setLoader(true);
        try {
            const baseUrl = import.meta.env.VITE_SH_BE_URI;
            if (!baseUrl) {
                throw new Error('VITE_SH_BE_URI is not configured');
            }
            const url = baseUrl + 'api/posts/all';
            const response = await axios.get(url, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                    'Content-Type': 'application/json',
                }
            });
            const postsData = response?.data?.data;
            setPosts(Array.isArray(postsData) ? postsData : []);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]);
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchPosts();
        } else {
            window.location.href = '/login';
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return null;
    }

    const toggleComments = (postId, focusInput = false) => {
        if (expandedPostId === postId) {
            setExpandedPostId(null);
            setFocusCommentInput(false);
        } else {
            setExpandedPostId(postId);
            setFocusCommentInput(focusInput);
        }
    };

    const PostCard = ({ post }) => {
        const authorName = post.created_by;
        const isExpanded = expandedPostId === post.post_id;
        const preview = post.content?.length > 200 && !isExpanded
            ? post.content.substring(0, 200) + '...'
            : post.content;

        return (
            <article className="fb-post-card">
                <div className="fb-post-header d-flex align-items-center gap-2">
                    <div className="fb-avatar">{getInitials(authorName)}</div>
                    <div className="flex-grow-1">
                        <div className="fb-post-author">{authorName}</div>
                        <div className="fb-post-meta d-flex align-items-center gap-1">
                            <span>{formatTime(post.created_at)}</span>
                            <span>·</span>
                            <span className="fb-type-badge">{post.type}</span>
                            <span>·</span>
                            <i className="bi bi-globe-americas"></i>
                        </div>
                    </div>
                </div>

                <div className="fb-post-body">
                    {post.title && <div className="fb-post-title">{post.title}</div>}
                    <div className="fb-post-content">{preview}</div>
                    {post?.tags?.length > 0 && (
                        <div className="mt-2">
                            {post.tags.map((tag, index) => (
                                <span key={index} className="fb-tag">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                {post.file_url && (
                    <Image src={post.file_url} alt={post.title} className="fb-post-image" />
                )}

                <div className="fb-post-actions">
                    <button type="button" className="fb-action-btn">
                        <i className="bi bi-hand-thumbs-up"></i> Like
                    </button>
                    <button
                        type="button"
                        className={`fb-action-btn ${isExpanded ? 'text-primary' : ''}`}
                        onClick={() => toggleComments(post.post_id, true)}
                    >
                        <i className="bi bi-chat"></i> Comment
                    </button>
                    <button type="button" className="fb-action-btn">
                        <i className="bi bi-share"></i> Share
                    </button>
                </div>

                <Collapse in={isExpanded}>
                    <div>
                        <CommentSection
                            postId={post.post_id}
                            autoFocus={focusCommentInput}
                        />
                    </div>
                </Collapse>
            </article>
        );
    };

    const CreatePostModal = () => {
        const [postInput, setPostInput] = useState({
            type: 'notes',
            title: '',
            content: '',
            tags: [],
            file: null,
        });
        const [tagInput, setTagInput] = useState('');
        const [submitting, setSubmitting] = useState(false);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setPostInput((prev) => ({
                ...prev,
                [name]: value,
            }));
        };

        const handleFileChange = (e) => {
            setPostInput((prev) => ({
                ...prev,
                file: e.target.files[0],
            }));
        };

        const handleTagInputChange = (e) => {
            setTagInput(e.target.value);
        };

        const handleAddTag = () => {
            const newTag = tagInput.trim();
            if (newTag && !postInput.tags.includes(newTag)) {
                setPostInput((prev) => ({
                    ...prev,
                    tags: [...prev.tags, newTag],
                }));
            }
            setTagInput('');
        };

        const handleRemoveTag = (tagToRemove) => {
            setPostInput((prev) => ({
                ...prev,
                tags: prev.tags.filter(tag => tag !== tagToRemove),
            }));
        };

        const handleTagInputKeyDown = (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                handleAddTag();
            }
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            setSubmitting(true);
            try {
                const formData = new FormData();
                formData.append('type', postInput.type);
                formData.append('title', postInput.title);
                formData.append('content', postInput.content);
                formData.append('tags', JSON.stringify(postInput.tags));
                if (postInput.file) {
                    formData.append('file', postInput.file);
                }

                const url = import.meta.env.VITE_SH_BE_URI + 'api/posts/create';
                await axios.post(url, formData, {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                        'Content-Type': 'multipart/form-data',
                    }
                });
                fetchPosts();
            } catch (error) {
                console.error('Error creating post:', error);
            } finally {
                setSubmitting(false);
                setCreatePostModal(false);
            }
        };

        return (
            <Modal show={true} onHide={() => setCreatePostModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title className="fw-bold fs-6 w-100 text-center">Create Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-muted">Post Type</Form.Label>
                            <Form.Select
                                name="type"
                                value={postInput.type}
                                onChange={handleChange}
                                required
                                size="sm"
                            >
                                <option value="notes">Notes</option>
                                <option value="jobs">Jobs</option>
                                <option value="queries">Queries</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-muted">Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                placeholder="Post title"
                                value={postInput.title}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-muted">What's on your mind?</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="content"
                                placeholder="Share something with the community..."
                                value={postInput.content}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-muted">Tags</Form.Label>
                            <InputGroup size="sm" className="mb-2">
                                <Form.Control
                                    type="text"
                                    placeholder="Add tag and press Enter"
                                    value={tagInput}
                                    onChange={handleTagInputChange}
                                    onKeyDown={handleTagInputKeyDown}
                                />
                                <Button variant="outline-secondary" onClick={handleAddTag} disabled={!tagInput.trim()}>
                                    Add
                                </Button>
                            </InputGroup>
                            <div className="d-flex gap-2 flex-wrap">
                                {postInput.tags.map((tag, idx) => (
                                    <Badge
                                        key={idx}
                                        bg="light"
                                        text="dark"
                                        className="border"
                                        role="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        title="Click to remove"
                                    >
                                        #{tag} &times;
                                    </Badge>
                                ))}
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold small text-muted">
                                <i className="bi bi-image me-1"></i> Photo
                            </Form.Label>
                            <Form.Control
                                type="file"
                                name="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                size="sm"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100 fw-semibold" disabled={submitting}>
                            {submitting ? 'Posting...' : 'Post'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        );
    };

    return (
        <>
            {loader && <Loader />}
            {createPostModal && <CreatePostModal />}

            <div className="fb-feed-wrapper">
                <div className="fb-composer">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="fb-avatar">
                            <i className="bi bi-person-fill"></i>
                        </div>
                        <button
                            type="button"
                            className="fb-composer-trigger"
                            onClick={() => setCreatePostModal(true)}
                        >
                            What's on your mind?
                        </button>
                    </div>
                    <div className="border-top pt-2 d-flex justify-content-around">
                        <button
                            type="button"
                            className="fb-action-btn"
                            onClick={() => setCreatePostModal(true)}
                        >
                            <i className="bi bi-image text-success"></i> Photo
                        </button>
                        <button
                            type="button"
                            className="fb-action-btn"
                            onClick={() => setCreatePostModal(true)}
                        >
                            <i className="bi bi-tag text-primary"></i> Tag
                        </button>
                        <button
                            type="button"
                            className="fb-action-btn"
                            onClick={() => setCreatePostModal(true)}
                        >
                            <i className="bi bi-question-circle text-warning"></i> Query
                        </button>
                    </div>
                </div>

                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post.post_id} post={post} />
                    ))
                ) : (
                    <div className="fb-empty-state">
                        <i className="bi bi-newspaper text-muted fs-1 mb-3 d-block"></i>
                        <h5 className="fw-semibold mb-2">No posts yet</h5>
                        <p className="text-muted small mb-3">Be the first to share something with the community!</p>
                        <Button variant="primary" onClick={() => setCreatePostModal(true)}>
                            Create Post
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;
