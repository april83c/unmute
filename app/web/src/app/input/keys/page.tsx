'use client';

import { Box, Button, Card, Flex, Grid, Heading, IconButton, Spinner, Text, TextField } from "@radix-ui/themes";
import styles from "./page.module.css";
import core from '@/client/core';
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import Form from 'next/form';
import { Send16Regular } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { Words } from "@unmute/core";

export default function KeysInput({ onHistory }: { onHistory?: (words: Words) => void }) {
	const [inputContent, setInputContent] = useState<string>('');
	const [socket, setSocket] = useState<ReturnType<typeof core.input.keys.socket.subscribe>>()

	const webKeysModule = useQuery({
		queryKey: ['module', 'active', 'input', 'web_keys'],
		queryFn: async () => (await core.module.active({ type: 'input' })({ id: 'web_keys' }).get())
	});

	useEffect(() => {
		if (webKeysModule.status == 'success' && webKeysModule.data.data != null) {
			const socket = core.input.keys.socket.subscribe();

			socket.on('open', () => {
				setSocket(socket);
			});

			socket.on('close', () => {
				setSocket(undefined);
			});

			socket.on('message', (message) => {
				switch(message.data) {
					case -1:
						socket.send(-1);
					default:
						console.log('Unknown socket message received:', message.data)
				}
			})

			return () => {
				socket?.close();
			}
		}
	}, [webKeysModule.status, webKeysModule.data])

	useEffect(() => {
		if (socket != undefined) {
			socket.send({ progress: inputContent });
		}
	}, [inputContent, socket]);

	switch(webKeysModule.status) {
		case 'success':
			if (webKeysModule.data.data != null) {
				return <>
					<Form action='' onSubmit={(e) => {
						e.preventDefault();
						if (socket != undefined) {
							socket.send({ sentence: inputContent });
							if (onHistory != undefined) onHistory(inputContent);
							e.currentTarget.reset();
						}
					}}>
						<TextField.Root placeholder='Type your words here!' onChange={(e) => {setInputContent(e.target.value)}}>
							<TextField.Slot side='right'>
								<IconButton variant='ghost' formAction='submit'>
									<Send16Regular />
								</IconButton>
							</TextField.Slot>
						</TextField.Root>
					</Form>
					
				</>
			} else {
				switch((webKeysModule.data.error.value as any).code) {
					case 'RESOURCE_NOT_FOUND':
						// TODO: better
						return (
							<Text>
								Module not active...
							</Text>
						)
					default:
						throw webKeysModule.data.error.value;
				}
			}
		case 'pending':
			// TODO: Skeleton
			return <Spinner />
		case 'error':
			throw webKeysModule.error;
	}
}
