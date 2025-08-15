'use client';

import { Box, Button, Card, Flex, Grid, Heading, Spinner, Text } from "@radix-ui/themes";
import styles from "./page.module.css";
import { GearIcon, KeyboardIcon, PlusIcon, SpeakerLoudIcon } from "@radix-ui/react-icons";
import Microphone from '@/icons/Microphone.svg';
import Keyboard from '@/icons/Keyboard.svg';
import Windows11 from '@/icons/Windows11.svg';
import Globe from '@/icons/Globe.svg';
import FolderOpen from '@/icons/FolderOpen.svg';
import core from '@/client/core';
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

export function ModuleCard({ children, variant = 'outline' }: {
	children: React.ReactNode,
	variant?: "classic" | "solid" | "soft" | "surface" | "outline" | "ghost"
}) {
	return (
		<Button variant={variant} className={styles.homeCard}>
			<Flex direction="column" align="end">
				{children}
			</Flex>
		</Button>
	)
}

export default function Index() {
	const status = useQuery({
		queryKey: ['core', 'status'],
		queryFn: async () => (await core.status.get())
	});

	switch(status.status) {
		case 'success':
			if (status.data.data != null) {
				return (
					<Text>
						{JSON.stringify(status.data.data, null, 2)}
					</Text>
				)
			} else {
				switch((status.data.error.value as any).code) {
					default:
						throw status.data.error.value;
				}
			}
		case 'pending':
			// TODO: Skeleton
			return <Spinner />
		case 'error':
			throw status.error;
	}

	/*return (
		<>
			<Text as='p' my='3'>
				<Suspense fallback={<Text>Loading...</Text>}>
					{JSON.stringify(status.data?.data, null, 2)}
				</Suspense>
			</Text>
			<Heading my='3'>Input modules</Heading>
			<Grid columns={{ initial: '2', xs: '4' }} gap="3">
				<ModuleCard variant='solid'>
					<Keyboard fill="currentColor" /> <Text>Web Keys</Text>
				</ModuleCard>
				<ModuleCard>
					<Microphone fill="currentColor" /> <Text>Web Speech</Text>
				</ModuleCard>
				<ModuleCard>
					<Windows11 fill="currentColor" /> <Text>Azure Speech</Text>
				</ModuleCard>
			</Grid>

			<Heading my='3'>Output modules</Heading>
			<Grid columns={{ initial: '2', xs: '4' }} gap="3">
				<ModuleCard variant='solid'>
					<Windows11 fill="currentColor" /> <Text>Edge TTS</Text>
				</ModuleCard>
				<ModuleCard variant='solid'>
					<FolderOpen fill="currentColor" /> <Text>Text-file Subtitle</Text>
				</ModuleCard>
				<ModuleCard>
					<Windows11 fill="currentColor" /> <Text>Azure Speech</Text>
				</ModuleCard>
				<ModuleCard>
					<Globe fill="currentColor" /> <Text>Web Subtitle</Text>
				</ModuleCard>
			</Grid>
		</>
	);*/
}
