'use client';

import styles from './page.module.css';
import core from '@/client/core';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Words } from '@unmute/core';

export default function SubtitleOutput({}: {}) {
	const [subtitleContent, setSubtitleContent] = useState<Words>({
		text: '',
		redacted: false
	});

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
								&& 'text' in message.data
								&& typeof message.data.text == 'string'
								&& 'redacted' in message.data
								&& typeof message.data.redacted == 'boolean'
							) {
								setSubtitleContent(message.data as Words);
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
				const text = socket ? subtitleContent.text : 'Disconnected.';
				const className = socket
					? subtitleContent.redacted
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
