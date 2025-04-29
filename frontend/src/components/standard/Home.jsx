import React from 'react';
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
} from '@material-tailwind/react';
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  KeyIcon,
  ClockIcon,
  ServerIcon,
  DocumentDuplicateIcon 
} from '@heroicons/react/24/solid';

const Home = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <Typography variant="h1" className="mb-4">
          ExamChain
        </Typography>
        <Typography variant="lead" className="text-gray-700">
          A Blockchain-Based Secure Examination System
        </Typography>
      </div>

      {/* Problem Statement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="mt-6">
          <CardHeader color="blue" className="relative h-16 ">
            <div className="absolute left-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <DocumentDuplicateIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-8">
            <Typography variant="h5" className="mb-2">Pre-Exam Issues</Typography>
            <ul className="list-disc pl-4">
              <li>Question paper leaks</li>
              <li>Database vulnerabilities</li>
              <li>Centralized storage risks</li>
            </ul>
          </CardBody>
        </Card>

        <Card className="mt-6">
          <CardHeader color="green" className="relative h-16">
            <div className="absolute  left-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-8">
            <Typography variant="h5" className="mb-2">During Exam Issues</Typography>
            <ul className="list-disc pl-4">
              <li>Answer sheet tampering</li>
              <li>Limited cheating prevention</li>
              <li>Identity verification</li>
            </ul>
          </CardBody>
        </Card>

        <Card className="mt-6">
          <CardHeader color="red" className="relative h-16">
            <div className="absolute  left-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <ServerIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-8">
            <Typography variant="h5" className="mb-2">Post-Exam Issues</Typography>
            <ul className="list-disc pl-4">
              <li>Delayed results</li>
              <li>Lack of transparency</li>
              <li>Result manipulation risks</li>
              <li>Privacy concerns</li>
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Solution Timeline */}
      <Typography variant="h3" className="text-center mb-8">
        Our Solution
      </Typography>
      <Timeline>
        <TimelineItem>
          <TimelineConnector />
          <TimelineHeader>
            <TimelineIcon className="p-2">
              <ShieldCheckIcon className="h-4 w-4" />
            </TimelineIcon>
            <Typography variant="h5">Decentralized Trust System</Typography>
          </TimelineHeader>
          <TimelineBody className="pb-8">
            <Typography color="gray">
              Distributed trust across multiple organizations using blockchain technology,
              eliminating single points of failure and creating immutable records.
            </Typography>
          </TimelineBody>
        </TimelineItem>

        <TimelineItem>
          <TimelineConnector />
          <TimelineHeader>
            <TimelineIcon className="p-2">
              <LockClosedIcon className="h-4 w-4" />
            </TimelineIcon>
            <Typography variant="h5">Multi-Layer Encryption</Typography>
          </TimelineHeader>
          <TimelineBody className="pb-8">
            <Typography color="gray">
              Advanced encryption mechanisms for questions, answers, and results using
              AES-256-CBC encryption and secure key management.
            </Typography>
          </TimelineBody>
        </TimelineItem>

        <TimelineItem>
          <TimelineHeader>
            <TimelineIcon className="p-2">
              <KeyIcon className="h-4 w-4" />
            </TimelineIcon>
            <Typography variant="h5">Shamir's Secret Sharing</Typography>
          </TimelineHeader>
          <TimelineBody>
            <Typography color="gray">
              Key sharding implementation for distributed trust, requiring multiple
              parties to collaborate for accessing sensitive information.
            </Typography>
          </TimelineBody>
        </TimelineItem>
      </Timeline>

      {/* Security Diagram */}
      <div className="mt-12 bg-gray-50 p-6 rounded-xl">
        <Typography variant="h4" className="text-center mb-6">
          Security Architecture
        </Typography>
        <div className="flex justify-center">
          <img 
            src="/soft_arch.png" 
            alt="Security Architecture" 
            className="max-w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
