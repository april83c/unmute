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
import SpeechRecognition, {
	useSpeechRecognition
} from 'react-speech-recognition';

export default function SpeechInput({
	onHistory
}: {
	onHistory?: (words: Words) => void;
}) {
	const [inputContent, setInputContent] = useState<string>('');

	const _thingForTypes = core.input({ module: 'speech' })({ id: '' }).socket
		.subscribe;
	const [socket, setSocket] = useState<ReturnType<typeof _thingForTypes>>();

	const [speechRecognitionIsActive, _setSpeechRecognitionIsActive] =
		useState<boolean>(false);

	function setSpeechRecognitionIsActive(value: boolean) {
		_setSpeechRecognitionIsActive(value);

		if (value) SpeechRecognition.startListening();
		else if (!value && listening) SpeechRecognition.stopListening();
	}

	const {
		transcript,
		listening,
		resetTranscript,
		browserSupportsSpeechRecognition,
		browserSupportsContinuousListening,
		isMicrophoneAvailable
	} = useSpeechRecognition();

	const activeModules = useQuery({
		queryKey: ['module', 'active'],
		queryFn: async () => await core.module.active.get()
	});

	useEffect(() => {
		if (activeModules.status == 'success') {
			const module = activeModules.data.data.input.find(
				(i: any) => i.moduleId == 'web_speech'
			);

			if (module) {
				const socket = core
					.input({ module: 'speech' })({ id: module.instanceId ?? '' })
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
		if (!speechRecognitionIsActive) return;
		if (transcript.length < 1) {
			if (!listening) SpeechRecognition.startListening();
			return;
		}
		if (socket == undefined) return;

		if (!listening) {
			socket.send({ sentence: transcript });
			if (onHistory) onHistory({ text: transcript, redacted: false });
			resetTranscript();
			SpeechRecognition.startListening();
		} else {
			socket.send({ progress: transcript });
		}
	}, [SpeechRecognition, listening, transcript]);

	useEffect(() => {
		if (socket != undefined) {
			socket.send({ progress: inputContent });
		}
	}, [inputContent, socket]);

	switch (activeModules.status) {
		case 'success':
			if (activeModules.data.data != null) {
				if (
					!browserSupportsSpeechRecognition
					//|| !browserSupportsContinuousListening
				) {
					return (
						<Text>
							This browser does not support Speech Recongition... try with a
							modern browser like Chrome or Safari!
						</Text>
					);
				}

				if (!isMicrophoneAvailable) {
					return (
						<Text>
							Looks like you did not grant permission to the microphone, or it
							is not available... please check?
						</Text>
					);
				}

				return (
					<>
						<Button
							onClick={() => {
								setSpeechRecognitionIsActive(!speechRecognitionIsActive);
							}}
						>
							{speechRecognitionIsActive ? 'Stop listening' : 'Start listening'}
						</Button>
						<Text>Transcript: {transcript}</Text>
					</>
				); /*(
					<>
						<Form
							action=""
							onSubmit={(e) => {
								e.preventDefault();
								if (socket != undefined) {
									socket.send({ sentence: inputContent });
									if (onHistory != undefined) onHistory(inputContent);
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
				);*/
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
