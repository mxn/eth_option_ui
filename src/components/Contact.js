import React from 'react'
import {Form, FormGroup, Col, FormControl, Grid,
  InputGroup, Button, Row} from 'react-bootstrap'

export const Contact = () => (
  <Grid>
  <Row>
    <Col><h4>Join Telegram <a href="https://t.me/joinchat/H8wrRxBiMG19jwvFbxrhfA">
      erc20-options </a> group or leave a message here:</h4></Col>
  </Row>
  <Row>
    <Col sm={6}>
    <Form horizontal action="https://formspree.io/sub.mxn@gmail.com" method="POST">

      <FormGroup controlId="formHorizontalEmail">
        <InputGroup>
          <InputGroup.Addon>Your Email</InputGroup.Addon>
          <FormControl name="_replyto" type="email" placeholder="Enter your email"/>
        </InputGroup>
      </FormGroup>
      <FormGroup controlId="formControlsTextarea">
        <FormControl name="body" componentClass="textarea" rows={10} placeholder="Your message" />
      </FormGroup>
      <Button className="Button-action" bsStyle="success" type="submit">Submit</Button>
    </Form>
    </Col>
    </Row>
    </Grid>
  )
