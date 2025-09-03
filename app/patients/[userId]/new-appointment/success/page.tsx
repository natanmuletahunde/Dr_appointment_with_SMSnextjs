import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getAppointment } from '@/lib/actions/appointment.actions';
import { Doctors } from '@/constants';

const Success = async ({params:{userId},searchParams}:SearchParamProps) => {
const appointmentId= (searchParams?.appointmentId as string) || "";
const appointment = await getAppointment(appointmentId);
const doctor = Doctors.find((doc)=>doc.name === appointment.primaryPhysician);

  return (
    <div className='flex h-screen max-h-screen px[5%]'>
        <div className='success-img'>
        <Link href="/">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="logo"
            className="h-10 w-fit"
          />
        </Link>
        </div>


    </div>
  )
}

export default Success
