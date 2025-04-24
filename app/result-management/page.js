'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Row, Col, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MyVerticallyCenteredModal } from '@/EditEntries';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import AddCategoryforkey from '@/AddKeyForCategory';
import moment from 'moment';
import { HOST } from '@/static';

// Round time to next 15 minutes in ISO format
const getRoundedISOTime = () => {
	const now = moment();
	const rounded = now
		.clone()
		.startOf('minute')
		.add(15 - (now.minute() % 15), 'minutes');
	return rounded.toISOString();
};

const Home = () => {
	const roundedTimeISO = getRoundedISOTime();
	const nextResultISO = moment(roundedTimeISO).add(30, 'minutes').toISOString();

	const [results, setResults] = useState([]);
	const [modalShow, setModalShow] = useState(false);
	const [catName, setCatName] = useState('');
	const [getCategories, setCategories] = useState([]);

	const [form, setForm] = useState({
		categoryname: '',
		date: moment().format('YYYY-MM-DD'),
		number: '',
		result: [{ time: '', number: '' }],
		next_result: nextResultISO,
		key: '',
		time: roundedTimeISO,
	});

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === 'time') {
			const selectedTime = moment(`${form.date}T${value}`, 'YYYY-MM-DDTHH:mm');
			if (!selectedTime.isValid()) return;

			const rounded = selectedTime
				.clone()
				.startOf('minute')
				.add(15 - (selectedTime.minute() % 15), 'minutes');
			const next = rounded.clone().add(30, 'minutes');

			setForm((prev) => ({
				...prev,
				time: rounded.toISOString(),
				next_result: next.toISOString(),
			}));
		} else {
			setForm((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleAddResult = (e) => {
		e.preventDefault();

		axios
			.post(
				`${HOST}/result`,
				{
					categoryname: form.categoryname,
					time: form.time,
					number: form.number,
					next_result: form.next_result,
					result: [{ time: form.time, number: form.number }],
					date: form.date,
					key: form.key,
				},
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('authToken')}`,
					},
				}
			)
			.then(() => {
				apiforResults();
				const newRoundedTime = getRoundedISOTime();
				const newNextResult = moment(newRoundedTime)
					.add(30, 'minutes')
					.toISOString();
				setForm({
					categoryname: '',
					number: '',
					result: [{ time: '', number: '' }],
					next_result: newNextResult,
					key: '',
					time: newRoundedTime,
					date: moment().format('YYYY-MM-DD'),
				});
			})
			.catch(console.error);
	};

	const apiforResults = () => {
		axios
			.get(`${HOST}/fetch-result`, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('authToken')}`,
				},
			})
			.then((res) => setResults(res.data.data))
			.catch(console.error);
	};

	const handleDelete = (id) => {
		setModalShow(true);
		setCatName(id);
	};

	useEffect(() => {
		axios
			.get(`${HOST}/fetch-cate-result`, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('authToken')}`,
				},
			})
			.then((res) => setCategories(res.data.data))
			.catch(console.error);

		const interval = setInterval(apiforResults, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className='container py-4'>
			<Tabs
				defaultActiveKey='category'
				id='tabs-example'
				className='mb-3'>
				<Tab
					eventKey='category'
					title='Add Category'>
					<AddCategoryforkey />
				</Tab>
				<Tab
					eventKey='result'
					title='Add Result'>
					<Row className='mb-4'>
						<Col md={12}>
							<Card>
								<Card.Header>Create New Result</Card.Header>
								<Card.Body>
									<Form onSubmit={handleAddResult}>
										<Row className='g-3 container'>
											<Col md={4}>
												<Form.Label>Category</Form.Label>
												<Form.Select
													name='categoryname'
													value={form.categoryname}
													onChange={handleChange}
													required>
													<option value=''>Select Category</option>
													{getCategories?.map((cat, i) => (
														<option
															key={i}
															value={cat.categoryname}>
															{cat.categoryname}
														</option>
													))}
												</Form.Select>
											</Col>
											<Col md={4}>
												<Form.Label>Key</Form.Label>
												<Form.Control
													type='text'
													name='key'
													value={form.key}
													onChange={handleChange}
													required
												/>
											</Col>
											<Col md={4}>
												<Form.Label>Date</Form.Label>
												<Form.Control
													type='date'
													name='date'
													value={form.date}
													min={moment().format('YYYY-MM-DD')}
													onChange={handleChange}
													required
												/>
											</Col>
											<Col
												md={4}
												className='mt-3'>
												<Form.Label>Result Time</Form.Label>
												<Form.Control
													type='time'
													name='time'
													value={moment(form.time).format('HH:mm')}
													onChange={handleChange}
													required
												/>
											</Col>
											<Col md={4}>
												<Form.Label>Number</Form.Label>
												<Form.Control
													type='text'
													name='number'
													value={form.number}
													onChange={(e) => {
														const val = e.target.value.replace(/\D/g, ''); // Remove non-digits
														if (val.length <= 4) {
															setForm((prev) => ({
																...prev,
																number: val,
															}));
														}
													}}
													maxLength={4}
													required
													placeholder='Enter 4-digit number'
												/>
												{form.number.length > 0 && form.number.length !== 4 && (
													<div style={{ color: 'red', fontSize: '0.9rem' }}>
														Number must be exactly 4 digits.
													</div>
												)}
											</Col>
											<Col
												md={4}
												className='mt-3'>
												<Form.Label>Next Result</Form.Label>
												<Form.Control
													type='time'
													name='next_result'
													value={moment(form.next_result).format('HH:mm')}
													disabled
												/>
											</Col>
										</Row>
										<div className='mt-3 text-end'>
											<Button
												type='submit'
												variant='primary'>
												Submit Result
											</Button>
										</div>
									</Form>
								</Card.Body>
							</Card>
						</Col>
					</Row>

					<MyVerticallyCenteredModal
						show={modalShow}
						onHide={() => setModalShow(false)}
						catname={catName}
					/>

					<Row>
						<Col md={12}>
							<Card>
								<Card.Header>Results List</Card.Header>
								<Card.Body>
									<Table
										striped
										bordered
										hover
										responsive>
										<thead>
											<tr>
												<th>#</th>
												<th>Category</th>
												<th>Date</th>
												<th>Number</th>
												<th>Result (Time - Number)</th>
												<th>Next Result</th>
											</tr>
										</thead>
										<tbody>
											{results.map((res) => (
												<tr key={res._id}>
													<td>{res._id}</td>
													<td>{res.categoryname}</td>
													<td>{res.date}</td>
													<td>{res.number}</td>
													<td>
														{res.result.map((r, i) => (
															<div key={i}>
																{moment(r.time).format('HH:mm')} - {r.number}
															</div>
														))}
													</td>
													<td>{moment(res.next_result).format('HH:mm')}</td>
												</tr>
											))}
										</tbody>
									</Table>
								</Card.Body>
							</Card>
						</Col>
					</Row>
				</Tab>
			</Tabs>
		</div>
	);
};

export default Home;
