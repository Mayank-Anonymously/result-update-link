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
const Home = () => {
  const [results, setResults] = useState([]);
  const [modalShow, setModalShow] = React.useState(false);
  const [catName, setCatName] = useState("");
  const [getCategories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryname: "",
    date: "",
    number: "",
    result: [{ time: "", number: "" }],
    next_result: "",
    key: "",
  });

  // Handle top-level input change
  const handleChange = (e) => {
    const { name, value } = e.target; // value will be like "14:30"

    if (name === "time") {
      const timestamp = moment(value, "HH:mm").valueOf(); // converts to Unix ms
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
        result: form.result,
        date: form.date,
        key: form.key,
      },
    };

    axios
      .request(options)
      .then(function (response) {
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
    });
  };

  // Delete entry
  const handleDelete = (id) => {
    setModalShow(true);
    setCatName(id);
  };

  useEffect(() => {
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

    apiforResults();
    fetchCategores();
  }, []);

  console.log("getCategories:", getCategories);
  return (
    <div className="container py-4">
      <Tabs
        defaultActiveKey="key"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="key" title="Add Category">
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
                        <Form.Select
                          name="categoryname"
                          value={form.categoryname}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Category</option>
                          {getCategories.map((item, index) => {
                            return (
                              <option value={item.categoryname}>
                                {item.categoryname}
                              </option>
                            );
                          })}
                        </Form.Select>
                      </Col>

                      <Col md={4}>
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
                        <Form.Control
                          type="date"
                          name="date"
                          placeholder="Date (YYYY-MM-DD)"
                          value={form.date}
                          onChange={handleChange}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          type="number"
                          name="number"
                          placeholder="Number"
                          value={form.number}
                          onChange={handleChange}
                          required
                        />
                      </Col>

                      <Col md={12}>
                        <h6 className="mt-3">Result Entries</h6>
                        {form.result.map((res, index) => (
                          <Row className="g-2 mb-2" key={index}>
                            <Col md={5}>
                              <Form.Control
                                type="time"
                                placeholder="Time"
                                value={res.time}
                                onChange={(e) =>
                                  handleResultChange(
                                    index,
                                    "time",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </Col>
                            <Col md={5}>
                              <Form.Control
                                type="number"
                                placeholder="Number"
                                value={res.number}
                                onChange={(e) =>
                                  handleResultChange(
                                    index,
                                    "number",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </Col>
                            <Col md={2}>
                              <Button
                                variant="danger"
                                onClick={() => removeResultRow(index)}
                              >
                                Remove
                              </Button>
                            </Col>
                          </Row>
                        ))}
                        <Button variant="secondary" onClick={addResultRow}>
                          + Add Result Entry
                        </Button>
                      </Col>

                      <Col md={4} className="mt-3">
                        <Form.Control
                          type="time"
                          name="next_result"
                          placeholder="Next Result"
                          value={form.next_result}
                          onChange={handleChange}
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
                        <tr key={res.id}>
                          <td>{res.id}</td>
                          <td>{res.categoryname}</td>
                          <td>{res.date}</td>
                          <td>{res.number}</td>
                          <td>
                            {res.result.map((r, i) => (
                              <div key={i}>
                                {r.time} - {r.number}
                              </div>
                            ))}
                          </td>
                          <td>{res.next_result}</td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(res.categoryname)}
                              type="button"
                            >
                              <MdDeleteForever />
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
