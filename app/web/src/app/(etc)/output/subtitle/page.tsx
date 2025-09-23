'use client';

import styles from './page.module.css';
import core from '@/client/core';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useReducer, useState } from 'react';
import { Words } from '@unmute/core';

enum SubtitleContentType {
	Progress = 0,
	Sentence = 1
}

const LENGTH_MULTIPLIER = 1;
const SUBTITLE_CONTENT_EMPTY = {
	words: { text: '', redacted: false },
	ends: 0,
	type: SubtitleContentType.Progress
};

type SubtitleContent = {
	type: SubtitleContentType;
	words: Words;
	ends: number;
};

export default function SubtitleOutput({}: {}) {
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	const [subtitleContent, _setSubtitleContent] = useState<SubtitleContent>(
		SUBTITLE_CONTENT_EMPTY
	);

	function setSubtitleContent(value: SubtitleContent) {
		_setSubtitleContent((subtitleContent) => {
			if (
				value.type == SubtitleContentType.Sentence
				|| subtitleContent.type == SubtitleContentType.Progress
				|| Date.now() > subtitleContent.ends
			) {
				setTimeout(() => {
					forceUpdate();
				}, value.ends - Date.now());

				return value;
			} else {
				return subtitleContent;
			}
		});
	}

	const _thingForTypes = core.output({ module: 'subtitle' })({ id: '' }).socket
		.subscribe;
	const [socket, setSocket] = useState<ReturnType<typeof _thingForTypes>>();

	const activeModules = useQuery({
		queryKey: ['module', 'active'],
		queryFn: async () => await core.module.active.get()
	});

	useEffect(() => {
		if (activeModules.status == 'success') {
			const module = activeModules.data.data.output.find(
				(i: any) => i.moduleId == 'web_subtitle'
			);

			if (module) {
				const socket = core
					.output({ module: 'subtitle' })({ id: module.instanceId ?? '' })
					.socket.subscribe();

				socket.on('open', () => {
					setSocket(socket);
				});

				socket.on('close', () => {
					setSocket(undefined);
				});

				socket.on('message', (message) => {
					switch (message.data) {
						case -1: {
							socket.send(-1);
							break;
						}
						default: {
							if (
								message.data
								&& typeof message.data == 'object'
								&& 'type' in message.data
								&& (message.data.type == 'sentence'
									|| message.data.type == 'progress')
								&& 'words' in message.data
								&& message.data.words
								&& typeof message.data.words == 'object'
								&& 'text' in message.data.words
								&& typeof message.data.words.text == 'string'
								&& 'redacted' in message.data.words
								&& typeof message.data.words.redacted == 'boolean'
							) {
								const words = message.data.words as Words;

								const length =
									message.data.type == 'sentence'
										? (words.lengthMs ?? words.text.length * 350 + 3000)
											* LENGTH_MULTIPLIER
										: 10000;

								const newContent = {
									words,
									ends: Date.now() + length,
									type:
										message.data.type == 'sentence'
											? SubtitleContentType.Sentence
											: SubtitleContentType.Progress
								};
								setSubtitleContent(newContent);
							} else {
								console.log(
									'Malformed or unknown socket message received:',
									message
								);
							}
						}
					}
				});

				return () => {
					socket?.close();
				};
			}
		}
	}, [activeModules.status, activeModules.data]);

	switch (activeModules.status) {
		case 'success':
			if (activeModules.data.data != null) {
				const text = socket
					? Date.now() > subtitleContent.ends
						? ''
						: subtitleContent.words.text
					: 'Disconnected.';
				const className = socket
					? subtitleContent.words.redacted
						? styles.redacted
						: styles.unredacted
					: styles.unredacted;

				return (
					<div className={styles.container}>
						{text.split(' ').flatMap((word, index) => [
							<span key={index.toString()} className={className}>
								{word}
							</span>,
							<span
								key={index.toString() + 'space'}
								className={styles.unredacted}
							>
								{' '}
							</span>
						])}
					</div>
				);
			} else {
				switch ((activeModules.data.error.value as any).code) {
					case 'RESOURCE_NOT_FOUND':
						// TODO: better
						return <span>Module not active...</span>;
					default:
						throw activeModules.data.error.value;
				}
			}
		case 'pending':
			// TODO: Skeleton
			return <span>Loading...</span>;
		case 'error':
			throw activeModules.error;
	}
}
