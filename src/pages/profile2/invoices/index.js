import React from 'react';
import { useSession } from 'next-auth/react';

import ProfileLayout from '../../../components/layout/ProfileLayout';


export default function General() {

    return (
        <>
        <ProfileLayout>
            <p>Invoices</p>
        </ProfileLayout>
        </>
    );
};

