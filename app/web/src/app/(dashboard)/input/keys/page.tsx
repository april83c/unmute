'use client';

import {
	Box,
	Button,
	Card,
	Flex,
	Grid,
	Heading,
	IconButton,
	Spinner,
	Text,
	TextField
} from '@radix-ui/themes';
import styles from './page.module.css';
import core from '@/client/core';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import Form from 'next/form';
import { Send16Regular } from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import { Words } from '@unmute/core';

export default function KeysInput({
	onHistory
}: {
	onHistory?: (words: Words) => void;
}) {
	const [inputContent, setInputContent] = useState<string>('');
	const _thingForTypes = core.input({ module: 'keys' })({ id: '' }).socket
		.subscribe;
	const [socket, setSocket] = useState<ReturnType<typeof _thingForTypes>>();

	const activeModules = useQuery({
		queryKey: ['module', 'active'],
		queryFn: async () => await core.module.active.get()
	});

	useEffect(() => {
		if (activeModules.status == 'success') {
			const module = activeModules.data.data.input.find(
				(i: any) => i.moduleId == 'web_keys'
			);

			if (module) {
				const socket = core
					.input({ module: 'keys' })({ id: module.instanceId ?? '' })
					.socket.subscribe();

				socket.on('open', () => {
					setSocket(socket);
				});

				socket.on('close', () => {
					setSocket(undefined);
				});

				socket.on('message', (message) => {
					switch (message.data) {
						case -1:
							socket.send(-1);
						default:
							console.log('Unknown socket message received:', message.data);
					}
				});

				return () => {
					socket?.close();
				};
			}
		}
	}, [activeModules.status, activeModules.data]);

	useEffect(() => {
		if (socket != undefined) {
			socket.send({ progress: inputContent });
		}
	}, [inputContent, socket]);

	switch (activeModules.status) {
		case 'success':
			if (activeModules.data.data != null) {
				return (
					<>
						<Form
							action=""
							onSubmit={(e) => {
								e.preventDefault();
								if (socket != undefined) {
									socket.send({ sentence: inputContent });
									if (onHistory != undefined)
										onHistory({ text: inputContent, redacted: false });
									e.currentTarget.reset();
								}
							}}
						>
							<TextField.Root
								placeholder="Type your words here!"
								onChange={(e) => {
									setInputContent(e.target.value);
								}}
								disabled={socket == undefined}
							>
								<TextField.Slot side="right">
									<IconButton variant="ghost" formAction="submit">
										<Send16Regular />
									</IconButton>
								</TextField.Slot>
							</TextField.Root>
						</Form>
					</>
				);
			} else {
				switch ((activeModules.data.error.value as any).code) {
					case 'RESOURCE_NOT_FOUND':
						// TODO: better
						return <Text>Module not active...</Text>;
					default:
						throw activeModules.data.error.value;
				}
			}
		case 'pending':
			// TODO: Skeleton
			return <Spinner />;
		case 'error':
			throw activeModules.error;
	}
}
