'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Button, Card, Container, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { HOST } from '@/static';

const LoginForm = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const response = await fetch(`${HOST}/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Login failed');
			}
			localStorage.setItem('email', email);
			localStorage.setItem('password', password);

			localStorage.setItem('authToken', data.authCode);
			router.push('/result-management');
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleForgotPassword = () => {
		// Replace with the correct reset password route
		router.push('/reset-password');
	};

	return (
		<Container
			className='d-flex justify-content-center align-items-center'
			style={{ minHeight: '100vh' }}>
			<Card style={{ width: '400px' }}>
				<Card.Body>
					<h3 className='text-center mb-4'>Login</h3>

					{error && <Alert variant='danger'>{error}</Alert>}

					<Form onSubmit={handleSubmit}>
						<Form.Group
							className='mb-3'
							controlId='formEmail'>
							<Form.Label>Email address</Form.Label>
							<Form.Control
								type='email'
								placeholder='Enter email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</Form.Group>

						<Form.Group
							className='mb-3'
							controlId='formPassword'>
							<Form.Label>Password</Form.Label>
							<Form.Control
								type='password'
								placeholder='Password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</Form.Group>

						<Button
							variant='primary'
							type='submit'
							className='w-100'
							disabled={loading}>
							{loading ? (
								<>
									<Spinner
										as='span'
										animation='border'
										size='sm'
										role='status'
										aria-hidden='true'
									/>{' '}
									Logging in...
								</>
							) : (
								'Login'
							)}
						</Button>
					</Form>

					{/* Forgot Password Link */}
					<div className='mt-3 text-center'>
						<Button
							variant='link'
							className='text-decoration-none'
							onClick={handleForgotPassword}>
							Forgot Password?
						</Button>
					</div>
				</Card.Body>
			</Card>
		</Container>
	);
};

export default LoginForm;
