'use client';
import axios from 'axios';
import React, { Suspense, useEffect, useState } from 'react';
import { Button, Form, Row, Col, Card, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { HOST } from '../../static';
import moment from 'moment';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';

function EditResultPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams(); // ✅ safe here (inside Suspense)
	const id = searchParams.get('id');
	const date = searchParams.get('date');
	const time = searchParams.get('time');

	const [timess, setTimess] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({
		categoryname: '',
		date: moment().format('YYYY-MM-DD'),
		number: '',
		result: [],
		next_result: '',
		key: '',
		time: '',
	});

	const [selectedDateIdx, setSelectedDateIdx] =
		(useState < number) | (null > null);
	const [selectedTimeIdx, setSelectedTimeIdx] =
		(useState < number) | (null > null);

	useEffect(() => {
		if (id) {
			axios
				.get(`${HOST}/result/${id}`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('authToken')}`,
					},
				})
				.then((res) => {
					const data = res.data.response;
					if (data) {
						const dateEntry = data.result.find((r) => r.date === date);
						const timesArray = dateEntry ? dateEntry.times : [];
						setTimess(timesArray);

						const timeEntry = timesArray.find((t) => t.time === time);

						setForm({
							categoryname: data.categoryname,
							date: date || data.date,
							number: timeEntry ? timeEntry.number : '',
							result: data.result || [],
							next_result: data.next_result,
							key: data.key,
							time: timeEntry ? timeEntry.time : '',
						});

						const dateIdx = data.result.findIndex((r) => r.date === date);
						setSelectedDateIdx(dateIdx !== -1 ? dateIdx : null);

						const timeIdx = timesArray.findIndex((t) => t.time === time);
						setSelectedTimeIdx(timeIdx !== -1 ? timeIdx : null);

						setLoading(false);
					}
				})
				.catch((err) => {
					console.error(err);
					setLoading(false);
				});
		}
	}, [id, date, time]);

	const handleSelectDate = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const idx = Number(e.target.value);
		setSelectedDateIdx(idx);
		setSelectedTimeIdx(null);
		setForm((prev) => ({
			...prev,
			time: '',
			number: '',
		}));
	};

	const handleSelectTime = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const idx = Number(e.target.value);
		setSelectedTimeIdx(idx);

		const selected = form.result[selectedDateIdx].times[idx];
		setForm((prev) => ({
			...prev,
			time: selected.time,
			number: selected.number,
		}));
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedDateIdx === null || selectedTimeIdx === null) {
			alert('Please select a date and time entry');
			return;
		}

		const dateEntry = form.result[selectedDateIdx];
		const timeEntry = dateEntry.times[selectedTimeIdx];

		setSaving(true);

		axios
			.put(
				`${HOST}/update-existing-result/${id}`,
				{
					date: dateEntry.date,
					time: timeEntry.time,
					number: form.number,
					next_result: form.next_result,
				},
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('authToken')}`,
					},
				}
			)
			.then((res) => {
				setSaving(false);
				if (res.data.message === 'Result updated successfully') {
					Swal.fire({
						icon: 'success',
						title: 'Success!',
						text: res.data.message,
						timer: 2000,
						showConfirmButton: false,
					});
					router.push('/result-management');
				} else {
					Swal.fire({
						icon: 'error',
						title: 'Error!',
						text: res.data.message,
						timer: 2000,
						showConfirmButton: false,
					});
				}
			})
			.catch((err) => {
				console.error(err);
				setSaving(false);
			});
	};

	if (loading) {
		return (
			<div className='container text-center py-5'>
				<Spinner animation='border' />
			</div>
		);
	}

	return (
		<div className='container py-4'>
			<Card>
				<Card.Header>Edit Result</Card.Header>
				<Card.Body>
					<Form onSubmit={handleUpdate}>{/* ... your form JSX ... */}</Form>
				</Card.Body>
			</Card>
		</div>
	);
}

// ✅ Wrap with Suspense at the page level
export default function EditResultPage() {
	return (
		<Suspense fallback={<div>Loading page...</div>}>
			<EditResultPageContent />
		</Suspense>
	);
}
