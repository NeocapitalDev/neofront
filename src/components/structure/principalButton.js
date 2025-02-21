// components/PrincipalButton.js
import React from 'react';
import Link from 'next/link';
import { principalButton } from './links';

const PrincipalButton = () => {
    return (
        <Link href={principalButton[0].href} passHref>
            <button className="bg-[var(--app-primary)] rounded-md text-black font-semibold px-4 py-3 w-full hover:bg-[var(--app-secondary)] transition duration-200">
                {principalButton[0].name}
            </button>
        </Link>
    );
};

export default PrincipalButton;
