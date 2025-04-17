"use client";
import axios from "axios";

import React, { useEffect, useState } from "react";
import { Table, Button, Form, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { MyVerticallyCenteredModal } from "@/EditEntries";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import AddCategoryforkey from "@/AddKeyForCategory";

import { FaPencilAlt } from "react-icons/fa";
import moment from "moment";

const Home = () => {
  const [results, setResults] = useState([]);
  const [modalShow, setModalShow] = React.useState(false);
  const [catName, setCatName] = useState("");
  const [getCategories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryname: "",
    date: moment().format("YYYY-MM-DD"), // 👈 default today's date,
    number: "",
    result: [{ time: "", number: "" }],
    next_result: "",
    key: "",
    time: "",
  });

  // Handle top-level input change
  const handleChange = (e) => {
    const { name, value } = e.target; // value will be like "14:30"

    if (name === "time") {
      const timestamp = moment(value, "HH:mm a").valueOf(); // converts to Unix ms
      setForm((prevForm) => ({
        ...prevForm,
        [name]: timestamp,
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle dynamic result field change
  const handleResultChange = (index, field, value) => {
    const updatedResult = [...form.result];
    updatedResult[index][field] = value;
    setForm({ ...form, result: updatedResult });
  };

  // Add new result row
  const addResultRow = () => {
    setForm({
      ...form,
      result: [...form.result, { time: "", number: "" }],
    });
  };

  // Remove result row
  const removeResultRow = (index) => {
    const updatedResult = [...form.result];
    updatedResult.splice(index, 1);
    setForm({ ...form, result: updatedResult });
  };

  // Submit handler
  const apiforResults = () => {
    const options = {
      method: "GET",
      url: "https://ewn-bat-ball.vercel.app/api/fetch-result",
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios
      .request(options)
      .then(function (response) {
        setResults(response.data.data);
        // console.log(response.data.datqa);
      })
      .catch(function (error) {
        console.error(error);
      });
  };
  const handleAddResult = (e) => {
    e.preventDefault();

    const options = {
      method: "POST",
      url: "https://ewn-bat-ball.vercel.app/api/result",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        categoryname: form.categoryname,
        time: form.time,
        number: form.number,
        next_result: form.next_result,
        result: [
          {
            time: form.time,
            number: form.number,
          },
        ],
        date: form.date,
        key: form.key,
      },
    };

    axios
      .request(options)
      .then(function (response) {
        apiforResults();
        console.log(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });

    // Reset form
    setForm({
      categoryname: "",
      date: "",
      number: "",
      result: [{ time: "", number: "" }],
      next_result: "",
      key: "",
      time: "",
    });
  };

  // Delete entry
  const handleDelete = (id) => {
    setModalShow(true);
    setCatName(id);
  };

  useEffect(() => {
    const fetchCategores = () => {
      const options = {
        method: "GET",
        url: "https://ewn-bat-ball.vercel.app/api/fetch-cate-result",
        headers: {
          "Content-Type": "application/json",
        },
      };

      axios
        .request(options)
        .then(function (response) {
          setCategories(response.data.data);
          // console.log(response.data.datqa);
        })
        .catch(function (error) {
          console.error(error);
        });
    };
    setInterval(() => {
      apiforResults();
    }, 1000);
    fetchCategores();
  }, []);

  return (
    <div className="container py-4">
      <Tabs
        defaultActiveKey="category"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="category" title="Add Category">
          <AddCategoryforkey />
        </Tab>
        <Tab eventKey="result" title="Add Result">
          <Row className="mb-4">
            <Col md={12}>
              <Card>
                <Card.Header>Create New Result</Card.Header>
                <Card.Body>
                  <Form onSubmit={handleAddResult}>
                    <Row className="g-3 container">
                      <Col md={4}>
                        <Form.Label htmlFor="categoryname">Category</Form.Label>
                        <Form.Select
                          name="categoryname"
                          value={form.categoryname}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Category</option>
                          {getCategories.map((item, index) => (
                            <option value={item.categoryname} key={index}>
                              {item.categoryname}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>

                      <Col md={4}>
                        <Form.Label htmlFor="key">Key</Form.Label>
                        <Form.Control
                          type="text"
                          name="key"
                          placeholder="Please enter key"
                          value={form.key}
                          onChange={handleChange}
                          required
                        />
                      </Col>

                      <Col md={4}>
                        <Form.Label htmlFor="date">Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          placeholder="Date (YYYY-MM-DD)"
                          value={form.date || moment().format("YYYY-MM-DD")} // default if value empty
                          onChange={handleChange}
                          min={moment().format("YYYY-MM-DD")} // restricts to current or future date
                          required
                        />
                      </Col>

                      <Col md={4} className="mt-3">
                        <Form.Label htmlFor="time">Result Time</Form.Label>
                        <Form.Control
                          id="time"
                          type="time"
                          name="time"
                          placeholder="Next Result"
                          value={moment(form.time).format("HH:mm")}
                          onChange={(e) => {
                            const time = e.target.value;
                            const [hour, minute] = time.split(":").map(Number);

                            const totalMinutes = hour * 60 + minute;
                            const roundedMinutes =
                              Math.ceil(totalMinutes / 15) * 15;

                            const roundedHour = Math.floor(roundedMinutes / 60);
                            const roundedMinute = roundedMinutes % 60;

                            const roundedTime = moment()
                              .set({
                                hour: roundedHour,
                                minute: roundedMinute,
                                second: 0,
                              })
                              .toDate();

                            const timestamp = roundedTime.getTime();

                            handleChange({
                              target: {
                                name: "time",
                                value: timestamp,
                              },
                            });
                          }}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label htmlFor="number">Number</Form.Label>
                        <Form.Control
                          type="number"
                          name="number"
                          placeholder="Number"
                          value={form.number}
                          onChange={handleChange}
                          required
                        />
                      </Col>

                      <Col md={4} className="mt-3">
                        <Form.Label htmlFor="next_result">
                          Next Result
                        </Form.Label>
                        <Form.Control
                          id="next_result"
                          type="time"
                          name="next_result"
                          placeholder="Next Result"
                          value={moment(form.next_result).format("HH:mm")}
                          onChange={(e) => {
                            const time = e.target.value;
                            const [hour, minute] = time.split(":").map(Number);

                            const totalMinutes = hour * 60 + minute;
                            const roundedMinutes =
                              Math.ceil(totalMinutes / 15) * 15;

                            const roundedHour = Math.floor(roundedMinutes / 60);
                            const roundedMinute = roundedMinutes % 60;

                            const roundedTime = moment()
                              .set({
                                hour: roundedHour,
                                minute: roundedMinute,
                                second: 0,
                              })
                              .toDate();

                            const timestamp = roundedTime.getTime();

                            handleChange({
                              target: {
                                name: "next_result",
                                value: timestamp,
                              },
                            });
                          }}
                          required
                        />
                      </Col>
                    </Row>

                    <div className="mt-3 text-end">
                      <Button type="submit" variant="primary">
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
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Number</th>
                        <th>Result (Time - Number)</th>
                        <th>Next Result</th>
                        <th>Action</th>
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
                                {moment(parseInt(r.time)).format("HH:mm A")} -{" "}
                                {r.number}
                              </div>
                            ))}
                          </td>
                          <td>
                            {moment(parseInt(res.next_result)).format(
                              "HH:mm A"
                            )}
                          </td>
                          <td>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleDelete(res._id)}
                              type="button"
                            >
                              <FaPencilAlt />
                            </Button>
                          </td>
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
      {/* Form */}
    </div>
  );
};

export default Home;
