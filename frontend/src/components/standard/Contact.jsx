import React from 'react';
import { Typography, Card, CardBody, Input, Textarea, Button } from '@material-tailwind/react';

const Contact = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <Typography variant="h2" className="text-center mb-8">
        Contact Us
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardBody>
            <Typography variant="h4" color="blue" className="mb-4">
              Get in Touch
            </Typography>
            <Typography className="mb-4">
              Have questions about implementing ExamChain at your institution? 
              Our team is here to help you transition to a secure examination system.
            </Typography>
            
            <div className="space-y-4">
              <Typography variant="h6">Contact Information:</Typography>
              <Typography>Email: support@examchain.com</Typography>
              <Typography>Phone: +1 (555) 123-4567</Typography>
              <Typography>Address: Tech Hub, Innovation Street</Typography>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Typography variant="h4" color="blue" className="mb-4">
              Send us a Message
            </Typography>
            <form className="space-y-4">
              <div>
                <Typography variant="small" className="mb-2">Name</Typography>
                <Input type="text" size="lg" />
              </div>
              
              <div>
                <Typography variant="small" className="mb-2">Email</Typography>
                <Input type="email" size="lg" />
              </div>
              
              <div>
                <Typography variant="small" className="mb-2">Message</Typography>
                <Textarea rows={4} />
              </div>

              <Button color="blue" ripple="light" className="w-full">
                Send Message
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
