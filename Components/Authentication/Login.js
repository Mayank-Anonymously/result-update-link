// src/components/LoginForm.jsx
import Link from 'next/link';
import React, { useState } from 'react';
import { Form, Button, Card, Container } from 'react-bootstrap';

const LoginForm = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('Login submitted with:', { email, password });
		// You can add login logic here
	};

	return (
		<Container
			className='d-flex justify-content-center align-items-center'
			style={{ minHeight: '100vh' }}>
			<Card style={{ width: '400px' }}>
				<Card.Body>
					<h3 className='text-center mb-4'>Login</h3>
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
							className='w-100'>
							<Link href='/result-management'>Login</Link>
						</Button>
					</Form>
				</Card.Body>
			</Card>
		</Container>
	);
};

export default LoginForm;
