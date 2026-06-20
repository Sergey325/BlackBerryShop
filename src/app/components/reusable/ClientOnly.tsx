"use client"

import React, {useEffect, useState} from 'react';

type Props = {
    children: React.ReactNode
};

const ClientOnly = ({children}: Props) => {
    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasMounted(true)
    }, [])

    if(!hasMounted) return null

    return (
        <>
            {children}
        </>
    );
};

export default ClientOnly;
