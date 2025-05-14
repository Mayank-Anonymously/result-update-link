'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Button, Card, Container, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { HOST } from '@/static';

const PasswordResetForm = () => {
	const [step, setStep] = useState(1);
	const [email, setEmail] = useState('');
	const [otp, setOtp] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [oldPassword, setOldPassword] = useState('');

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const router = useRouter();

	const generateOtp = async () => {
		setError('');
		setLoading(true);
		try {
			const res = await fetch(`${HOST}/generate-otp`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
			setStep(2);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const verifyOtp = async () => {
		setError('');
		setLoading(true);
		try {
			const res = await fetch(`${HOST}/verify-otp`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, otp }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'OTP verification failed');
			setStep(3);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const resetPassword = async () => {
		setError('');
		setLoading(true);
		try {
			const res = await fetch(`${HOST}/resetpassword`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, oldPassword, newPassword }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Password reset failed');
			// On success you might redirect to login
			router.push('/');
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	console.log(oldPassword);
	return (
		<Container
			className='d-flex justify-content-center align-items-center'
			style={{ minHeight: '100vh' }}>
			<Card style={{ width: '400px' }}>
				<Card.Body>
					<h3 className='text-center mb-4'>Reset Password</h3>
					{error && <Alert variant='danger'>{error}</Alert>}

					{/* Step 1: Enter email & generate OTP */}
					{step === 1 && (
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
							<Button
								variant='primary'
								className='mt-2 w-100'
								onClick={generateOtp}
								disabled={loading || !email}>
								{loading ? (
									<Spinner
										animation='border'
										size='sm'
									/>
								) : (
									'Generate OTP'
								)}
							</Button>
						</Form.Group>
					)}

					{/* Step 2: Enter OTP & verify */}
					{step === 2 && (
						<>
							<Form.Group
								className='mb-3'
								controlId='formOtp'>
								<Form.Label>OTP</Form.Label>
								<Form.Control
									type='text'
									placeholder='Enter OTP'
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									required
								/>
							</Form.Group>
							<Button
								variant='primary'
								className='mb-3 w-100'
								onClick={verifyOtp}
								disabled={loading || !otp}>
								{loading ? (
									<Spinner
										animation='border'
										size='sm'
									/>
								) : (
									'Verify OTP'
								)}
							</Button>
						</>
					)}

					{/* Step 3: Enter New Password & reset */}
					{step === 3 && (
						<>
							<Form.Group
								className='mb-3'
								controlId='formNewPassword'>
								<Form.Label>Old Password</Form.Label>
								<Form.Control
									type='password'
									placeholder='Enter old password'
									value={oldPassword}
									onChange={(e) => setOldPassword(e.target.value)}
									required
								/>
							</Form.Group>
							<Form.Group
								className='mb-3'
								controlId='formNewPassword'>
								<Form.Label>New Password</Form.Label>
								<Form.Control
									type='password'
									placeholder='Enter new password'
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									required
								/>
							</Form.Group>
							<Button
								variant='success'
								className='w-100'
								onClick={resetPassword}
								disabled={loading || !newPassword}>
								{loading ? (
									<Spinner
										animation='border'
										size='sm'
									/>
								) : (
									'Reset Password'
								)}
							</Button>
						</>
					)}
				</Card.Body>
			</Card>
		</Container>
	);
};

export default PasswordResetForm;
