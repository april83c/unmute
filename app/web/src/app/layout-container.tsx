'use client';

import { Container, Theme, Text, Heading, Code, Button } from "@radix-ui/themes";
import styles from './layout.module.css';
import * as Nav from '@/components/nav';
import { QueryClientProvider, useQueryErrorResetBoundary } from "@tanstack/react-query";
import queryClient from '@/client/query';
import React from "react";
import dynamic from "next/dynamic";

function LayoutContainer({ children }: { children: React.ReactNode }) {
    const { reset } = useQueryErrorResetBoundary();
    return (
        <QueryClientProvider client={queryClient}>
            <Theme appearance='dark' panelBackground='translucent' accentColor='pink' className={styles.theme}>
                    <Nav.DefaultNav />
                    <Container className={styles.container} size='3'>
                        {children}
                    </Container>
            </Theme>
        </QueryClientProvider>
    );
}

export default dynamic(() => Promise.resolve(LayoutContainer), { ssr: false });