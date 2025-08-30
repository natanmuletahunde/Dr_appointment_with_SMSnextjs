"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CustomFormField from "../CustomFormField"
import { Label } from '@/components/ui/label';
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { UserFormValidation } from "@/lib/validation"

export enum FormFieldType {
    INPUT = 'input',
    TEXTAREA = 'textarea',
    SELECT = 'select',
    CHECKBOX = 'checkbox',
    DATE_PICKER = 'datePicker',
    SKELETON = 'skeleton',
    PHONE_INPUT = 'phoneInput',
}

const PatientForm = () => {
  const [isLoading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email:'',
      phone:'',
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof UserFormValidation>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
          <h1 className="header">Hi There 🖐️</h1>
          <p className="text-dark-700">Schedule your first appointment.</p>
        </section>

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="name"
          label="Full name"
          placeholder="piv nati"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="email"
          label="Email"
          placeholder="natan@gmail.com"
          iconSrc="/assets/icons/email.svg"
          iconAlt="email"
        />

        <CustomFormField
          fieldType={FormFieldType.PHONE_INPUT}
          control={form.control}
          name="phone"
          label="phone number"
          placeholder="925190-00357560"
        />

        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  )
}

export default PatientForm
