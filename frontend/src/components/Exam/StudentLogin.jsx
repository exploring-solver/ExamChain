import React from 'react'
import {
    Card,
    Input,
    Checkbox,
    Button,
    Typography,
} from "@material-tailwind/react";
const StudentLogin = () => {

    //todo: login and generate the public and private key pair where username is enrollment number and password is given but the private and public key is genrated upon login

    //navigate to exam window

    return (

        //add here logic to select your exam and then login with creds

        <div className="w-[90%] m-auto flex justify-center py-2 ">
            <Card color="transparent" shadow={false}>
                <Typography variant="h4" color="blue-gray">
                    Student Sign In
                </Typography>
                <Typography color="gray" className="mt-1 font-normal">
                    Nice to meet you! Enter your details to login.
                </Typography>
                <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="h6" color="blue-gray" className="-mb-3">
                            Username/Email
                        </Typography>
                        <Input
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
                            type="password"
                            size="lg"
                            placeholder="********"
                            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "before:content-none after:content-none",
                            }}
                        />
                    </div>
                    <Button className="mt-6" fullWidth>
                        Log In
                    </Button>
                </form>
            </Card>
        </div>
    )
}

export default StudentLogin