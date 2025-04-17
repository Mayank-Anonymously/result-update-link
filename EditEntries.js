import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { Table, Button, Form, Row, Col, Card } from "react-bootstrap";

export const MyVerticallyCenteredModal = (props) => {
  const [results, setResults] = useState([]);
  const [modalShow, setModalShow] = React.useState(false);

  const { catname } = props;
  const [form, setForm] = useState({
    categoryname: catname,
    time: "",
    number: "",
    next_result: "",
  });

  // Handle top-level input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle dynamic result field change
  const handleResultChange = (index, field, value) => {
    const updatedResult = [...form.result];
    updatedResult[index][field] = value;
    setForm({ ...form, result: updatedResult });
  };
  const handleAddResult = (e) => {
    e.preventDefault();

    const options = {
      method: "PUT",
      url: `https://ewn-bat-ball.vercel.app/api/update-existing-result/${catname}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        categoryname: catname,
        time: form.time,
        number: form.number,
        next_result: form.next_result,
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
      time: "",
      number: "",
      next_result: "",
    });
  };

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleAddResult}>
          <Row className="g-3 container">
            <Col md={4}>
              <label>Time</label>
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
                  const roundedMinutes = Math.ceil(totalMinutes / 15) * 15;

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
              <label>Number</label>

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
              <label>Next Result</label>

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
                  const roundedMinutes = Math.ceil(totalMinutes / 15) * 15;

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
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};
