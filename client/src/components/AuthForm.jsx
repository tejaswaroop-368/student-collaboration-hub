import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import Loader from './Loader';

const AuthForm = ({ isLogin }) => {
    const [input, setInput] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        bio: '',
    });
    const [loader, setLoader] = useState(false);
    const isAuthenticated = localStorage.getItem('token') != null;

    const triggerAPI = (payload) => {
        const url = import.meta.env.VITE_SH_BE_URI + `api/users/${isLogin ? 'login' : 'sign-up'}`;
        setLoader(true);
        axios.post(url, payload)
            .then((response) => {
                if (!isLogin && response.status === 200) {
                    alert('Sign up successful! You can now log in.');
                    window.location.href = '/login';
                } else if (response.status === 200) {
                    localStorage.setItem('token', response.data.data.token);
                    window.location.href = '/';
                }
            })
            .catch((error) => {
                alert('An error occurred. Please try again.');
                console.error('API error:', error);
            })
            .finally(() => {
                setLoader(false);
            });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (isLogin) {
            if (!input.email || !input.password) {
                alert('Please fill in all required fields!');
                return;
            }
            triggerAPI({ email: input.email, password: input.password });
            return;
        }

        if (input.password !== input.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        if (!input.name || !input.email || !input.password) {
            alert('Please fill in all required fields!');
            return;
        }
        triggerAPI(input);
    };

    if (isAuthenticated) {
        window.location.href = '/';
        return null;
    }

    return (
        <div className="auth-page">
            {loader && <Loader />}

            <header className="auth-header">
                <Link to={isLogin ? '/login' : '/signup'} className="auth-header-brand">
                    StudentHub
                </Link>
            </header>

            <main className="auth-main">
                <Container>
                    <Row className="auth-layout g-4 g-lg-5 align-items-center justify-content-between">
                        <Col xs={12} lg={6} className="auth-brand-col">
                            <h1 className="auth-brand-text">StudentHub</h1>
                            <p className="auth-tagline mb-0">
                                Connect and learn with students. Share notes, ask questions, and grow together.
                            </p>
                        </Col>

                        <Col xs={12} sm={10} md={8} lg={5} xl={4} className="auth-form-col">
                            <Card className="auth-card">
                                <Card.Body className="auth-card-body">
                                    <h2 className="auth-card-title">
                                        {isLogin ? 'Log in to StudentHub' : 'Sign Up'}
                                    </h2>

                                    <Form onSubmit={handleFormSubmit} className="auth-form">
                                        {!isLogin && (
                                            <Form.Group className="mb-3" controlId="authName">
                                                <Form.Label className="auth-label">Full name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter your full name"
                                                    value={input.name}
                                                    onChange={(e) => setInput((prev) => ({ ...prev, name: e.target.value }))}
                                                    required
                                                />
                                            </Form.Group>
                                        )}

                                        {!isLogin && (
                                            <Form.Group className="mb-3" controlId="authBio">
                                                <Form.Label className="auth-label">Bio <span className="auth-optional">(optional)</span></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Tell us about yourself"
                                                    value={input.bio}
                                                    onChange={(e) => setInput((prev) => ({ ...prev, bio: e.target.value }))}
                                                />
                                            </Form.Group>
                                        )}

                                        <Form.Group className="mb-3" controlId="authEmail">
                                            <Form.Label className="auth-label">Email address</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="you@example.com"
                                                value={input.email}
                                                onChange={(e) => setInput((prev) => ({ ...prev, email: e.target.value }))}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className={`mb-${isLogin ? '4' : '3'}`} controlId="authPassword">
                                            <Form.Label className="auth-label">Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Enter your password"
                                                value={input.password}
                                                onChange={(e) => setInput((prev) => ({ ...prev, password: e.target.value }))}
                                                required
                                            />
                                        </Form.Group>

                                        {!isLogin && (
                                            <Form.Group className="mb-4" controlId="authConfirmPassword">
                                                <Form.Label className="auth-label">Confirm password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Re-enter your password"
                                                    value={input.confirmPassword}
                                                    onChange={(e) => setInput((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                                    required
                                                />
                                            </Form.Group>
                                        )}

                                        <Button
                                            variant="primary"
                                            type="submit"
                                            className="auth-submit-btn w-100"
                                            size="lg"
                                        >
                                            {isLogin ? 'Log In' : 'Sign Up'}
                                        </Button>
                                    </Form>

                                    {isLogin && (
                                        <>
                                            <div className="auth-divider" />
                                            <div className="text-center">
                                                <Button
                                                    as={Link}
                                                    to="/signup"
                                                    variant="success"
                                                    className="auth-create-btn"
                                                >
                                                    Create New Account
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Card.Body>
                            </Card>

                            <p className="auth-switch-text text-center">
                                {isLogin ? (
                                    <>
                                        Don't have an account?{' '}
                                        <Link to="/signup" className="auth-switch-link">Sign up for StudentHub</Link>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <Link to="/login" className="auth-switch-link">Log in</Link>
                                    </>
                                )}
                            </p>
                        </Col>
                    </Row>
                </Container>
            </main>
        </div>
    );
};

export default AuthForm;
