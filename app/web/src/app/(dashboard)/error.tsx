'use client' // Error boundaries must be Client Components

import { Button, Code, Container, Heading } from '@radix-ui/themes'
import { useEffect } from 'react'
import styles from './layout.module.css';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <Container className={styles.container} size='3'>
            <Heading my='3'>An error occurred</Heading>
            <Code my='3'>{error.message}</Code>
            <Button onClick={() => reset()}>Try again</Button>
        </Container>
    )
}