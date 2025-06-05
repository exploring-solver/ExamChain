import React from 'react'
import {
    Card,
    Input,
    Checkbox,
    Button,
    Typography,
} from "@material-tailwind/react";
import { useNavigate } from 'react-router-dom';
import config from '../../config';

const OrganizationLogin = () => {
    const navigate = useNavigate();

    const handleLogin = (event) => {
        event.preventDefault();

        const emailOrUsername = event.target.emailOrUsername.value;
        const password = event.target.password.value;

        fetch(`${config.baseURL}/users/api/v1/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emailOrUsername,
                password,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    // Store token
                    localStorage.setItem('token', data.token);
                    
                    // Store user details
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Store organization details if they exist
                    if (data.organizationDetails) {
                        // Store complete organization details
                        localStorage.setItem('organizationDetails', JSON.stringify(data.organizationDetails));
                        
                        // Store organization ID in multiple formats for compatibility
                        localStorage.setItem('organizationId', data.organizationDetails._id);
                        localStorage.setItem('orgId', data.organizationDetails._id);
                        localStorage.setItem('user_organization_id', data.organizationDetails._id);
                        
                        // Store the UUID id as well (the custom id field)
                        if (data.organizationDetails.id) {
                            localStorage.setItem('organizationUUID', data.organizationDetails.id);
                        }
                        
                        // Store organization name for easy access
                        localStorage.setItem('organizationName', data.organizationDetails.name);
                        
                        console.log('Organization details stored:', {
                            _id: data.organizationDetails._id,
                            id: data.organizationDetails.id,
                            name: data.organizationDetails.name
                        });
                    }
                    
                    // Store student details if they exist (for future use)
                    if (data.studentDetails) {
                        localStorage.setItem('studentDetails', JSON.stringify(data.studentDetails));
                    }
                    
                    navigate('/org-dashboard');
                } else {
                    console.error('Login failed:', data.message || 'Unknown error');
                    // You might want to show an error message to the user here
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // You might want to show an error message to the user here
            });
    };

    return (
        <div className="w-[90%] m-auto flex justify-center py-2 ">
            <Card color="transparent" shadow={false}>
                <Typography variant="h4" color="blue-gray">
                    Organization Sign In
                </Typography>
                <Typography color="gray" className="mt-1 font-normal">
                    Nice to meet you! Enter your details to login.
                </Typography>
                <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={handleLogin}>
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="h6" color="blue-gray" className="-mb-3">
                            Username/Email
                        </Typography>
                        <Input
                            name="emailOrUsername"
                            size="lg"
                            placeholder="name@mail.com or username"
                            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "before:content-none after:content-none",
                            }}
                        />
                        <Typography variant="h6" color="blue-gray" className="-mb-3">
                            Password
                        </Typography>
                        <Input
                            name="password"
                            type="password"
                            size="lg"
                            placeholder="********"
                            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "before:content-none after:content-none",
                            }}
                        />
                    </div>
                    <Button type="submit" className="mt-6" fullWidth>
                        Log In
                    </Button>
                </form>
            </Card>
        </div>
    )
}

export default OrganizationLogin