"use client";

import React, { useState } from "react";
import { Button, Card, Input } from "ui-components";
import { toTitleCase } from "utils";

type PatientRegistrationFormProps = {
    onSubmit?: (data: { name: string; email: string; phone: string }) => void;
};

export function PatientRegistrationForm({
    onSubmit,
}: PatientRegistrationFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit?.({
            name: toTitleCase(name),
            email,
            phone,
        });
    };

    return (
        <Card title="Register patient">
            <form className="space-y-3" onSubmit={handleSubmit}>
                <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Patient name"
                    required
                />
                <Input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    type="email"
                    required
                />
                <Input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Phone"
                    required
                />
                <Button type="submit">Add patient</Button>
            </form>
        </Card>
    );
}
