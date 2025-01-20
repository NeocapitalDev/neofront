// components/NeoChallengeButton.js
import React from 'react';
import Link from 'next/link';

const PrincipalButton = () => {
    return (
        <Link href={"#"} passHref>
            <button className="bg-amber-500 rounded-md text-black font-semibold px-4 py-3 w-full hover:bg-amber-600 transition duration-200">
                Nuevo desafío NEO
            </button>
        </Link>
    );
};

export default PrincipalButton;
