import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import DriveFilesList from '../components/DriveFilesList';

const MonteCarloPage: React.FC = () => {
  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4">Monte Carlo Simulation</h2>
          <p>Welcome to the Monte Carlo simulation page.</p>
          <div className="my-4">
            <DriveFilesList />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default MonteCarloPage;
