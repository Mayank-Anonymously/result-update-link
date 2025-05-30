"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Table, Button, Form, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { MyVerticallyCenteredModal } from "@/EditEntries";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import AddCategoryforkey from "@/AddKeyForCategory";
import moment from "moment";
import { HOST } from "@/static";
import { useRouter } from "next/navigation";

const getRoundedISOTime = () => {
  const now = moment();
  const rounded = now
    .clone()
    .startOf("minute")
    .add(15 - (now.minute() % 15), "minutes");
  return rounded.toISOString();
};

const page = () => {
  const roundedTimeISO = getRoundedISOTime();
  const nextResultISO = moment(roundedTimeISO).add(15, "minutes").toISOString();
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [catName, setCatName] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    categoryname: "Minidiswar",
    date: moment().format("YYYY-MM-DD"),
    number: "",
    result: [{ time: "", number: "" }],
    next_result: nextResultISO,
    key: "md-9281",
    time: roundedTimeISO,
  });
  const [dataResults, setResultsdata] = useState(results);
  const [lastManualSubmit, setLastManualSubmit] = useState(null);
  console.log("form::", form);
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/"); // or use router.push('/login') if using Next.js routing
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "time") {
      const selectedTime = moment(`${form.date}T${value}`, "YYYY-MM-DDTHH:mm");
      if (!selectedTime.isValid()) return;

      const rounded = selectedTime
        .clone()
        .startOf("minute")
        .add(15 - (selectedTime.minute() % 15), "minutes");
      const next = rounded.clone().add(15, "minutes");

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

  console.log({
    categoryname: form.categoryname,
    time: moment(form.time).format("HH:mm A"),
    number: form.number,
    next_result: moment(form.next_result).format("HH:mm A"),
    result: [
      { time: moment(form.time).format("HH:mm A"), number: form.number },
    ],
    date: form.date,
    key: form.key,
    mode: "auto",
  });
  const handleAddResult = (e) => {
    e.preventDefault();
    axios
      .post(
        `${HOST}/result`,
        {
          categoryname: form.categoryname,
          time: moment(form.time).format("HH:mm"),
          number: form.number,
          next_result: moment(form.next_result).format("HH:mm"),
          result: [
            { time: moment(form.time).format("HH:mm"), number: form.number },
          ],
          date: form.date,
          key: form.key,
          mode: "auto",
        },

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      )
      .then(() => {
        apiforResults();
        setLastManualSubmit(moment());
        const newRoundedTime = getRoundedISOTime();
        const newNextResult = moment(newRoundedTime)
          .add(15, "minutes")
          .toISOString();
      })
      .catch(console.error);
  };

  const apiforResults = () => {
    axios
      .get(`${HOST}/fetch-result`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
      .then((res) => setResults(res.data.data))
      .catch(console.error);
  };

  const sortedData = (results) => {
    setResultsdata(
      combinedData.map((doc) => {
        // Sort each 'result' array inside each document
        const sortedResult = [...doc.result].sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        );
        return {
          ...doc._doc,
          result: sortedResult,
        };
      })
    );
  };

  useEffect(() => {
    apiforResults();
    setTimeout(() => {
      sortedData();
    }, 5000);
  }, []);
  return (
    <div className="container py-4">
      {/* Logout button */}
      <div className="d-flex justify-content-end mb-3">
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Tabs defaultActiveKey="result" id="tabs-example" className="mb-3">
        <Tab eventKey="result" title="Add Result">
          <Row className="mb-4">
            <Col md={12}>
              <Card>
                <Card.Header>Create New Result</Card.Header>
                <Card.Body>
                  <Form onSubmit={handleAddResult}>
                    <Row className="g-3 container">
                      <Col md={4}>
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                          type="text"
                          name="categoryname"
                          value={form.categoryname}
                          onChange={handleChange}
                          placeholder="Enter Category"
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label>Key</Form.Label>
                        <Form.Control
                          type="text"
                          name="key"
                          value={form.key}
                          onChange={handleChange}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={form.date}
                          min={moment().format("YYYY-MM-DD")}
                          onChange={handleChange}
                          required
                        />
                      </Col>
                      <Col md={4} className="mt-3">
                        <Form.Label>Result Time</Form.Label>
                        <Form.Control
                          type="time"
                          name="time"
                          value={moment(form.time).format("HH:mm")}
                          onChange={handleChange}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label>Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="number"
                          value={form.number}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length <= 2) {
                              setForm((prev) => ({
                                ...prev,
                                number: val,
                              }));
                            }
                          }}
                          maxLength={2}
                          required
                          placeholder="Enter number"
                        />
                        {form.number.length > 0 && form.number.length !== 2 && (
                          <div style={{ color: "red", fontSize: "0.9rem" }}>
                            Number must be exactly 2 digits.
                          </div>
                        )}
                      </Col>
                      <Col md={4} className="mt-3">
                        <Form.Label>Next Result</Form.Label>
                        <Form.Control
                          type="time"
                          name="next_result"
                          value={moment(form.next_result).format("HH:mm")}
                          disabled
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
                            {res.categoryname === "Minidiswar"
                              ? res.result.map((r, i) => (
                                  <>
                                    {r.times.map((y, i) => (
                                      <div key={i}>
                                        {y.time} - {y.number}
                                      </div>
                                    ))}
                                  </>
                                ))
                              : res.result.map((r, i) => (
                                  <div key={i}>
                                    {r.time} - {r.number}
                                  </div>
                                ))}
                          </td>
                          <td>{res.next_result}</td>
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

export default page;
