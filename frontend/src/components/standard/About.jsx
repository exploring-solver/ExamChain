import React from 'react';
import { Typography, Card, CardBody } from '@material-tailwind/react';

const About = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <Typography variant="h2" className="text-center mb-8">
        About ExamChain
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardBody>
            <Typography variant="h4" color="blue" className="mb-4">
              Our Mission
            </Typography>
            <Typography>
              ExamChain revolutionizes examination systems by implementing blockchain-inspired 
              security and transparency. We aim to eliminate paper leaks, result manipulation, 
              and create a trustless examination ecosystem.
            </Typography>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Typography variant="h4" color="blue" className="mb-4">
              Technology Stack
            </Typography>
            <Typography>
              Built using cutting-edge cryptographic techniques including:
            </Typography>
            <ul className="list-disc ml-6 mt-2">
              <li>AES-256-CBC Encryption</li>
              <li>Shamir's Secret Sharing</li>
              <li>Public Key Infrastructure</li>
              <li>Distributed Trust Model</li>
            </ul>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <Typography variant="h5" color="blue" className="mb-4">
              Pre-Exam Security
            </Typography>
            <Typography>
              Questions are encrypted and distributed across multiple organizations,
              requiring threshold-based consensus for access.
            </Typography>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Typography variant="h5" color="blue" className="mb-4">
              During Exam
            </Typography>
            <Typography>
              Real-time monitoring, cryptographic answer submission, and 
              tamper-proof response recording.
            </Typography>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Typography variant="h5" color="blue" className="mb-4">
              Post-Exam Integrity
            </Typography>
            <Typography>
              Immediate result generation, transparent evaluation process,
              and verifiable ranking system.
            </Typography>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default About;
