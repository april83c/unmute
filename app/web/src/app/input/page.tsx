'use client';

import core from "@/client/core";
import { Box, Button, Card, Flex, Heading, Separator, Spinner, Tabs, Text } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import KeysInput from './keys/page';
import { JSX, useState } from "react";
import type { Words } from "@unmute/core";
import { intlFormatDistance } from "date-fns";

const WEB_MODULES: {
    id: string, 
    friendlyName: string, 
    component: (props: { onHistory?: (words: Words) => void }) => JSX.Element
}[] = [
    {
        id: 'web_keys',
        friendlyName: 'Keys', // TODO: localize?
        component: KeysInput
    }
];

const TIME_FORMAT = new Intl.DateTimeFormat(navigator.language, { hour: '2-digit', minute: '2-digit' });

export default function InputIndex() {
    const activeModules = useQuery({
		queryKey: ['module', 'active'],
		queryFn: async () => (await core.module.active.get())
	});

    const [history, setHistory] = useState<{ words: Words, ts: Date }[]>([]);

    // TODO: Do we want history to be stored server-side...?
    const onHistory = (words: Words) => {
        setHistory([...history, { words, ts: new Date() }]);
    }

    switch(activeModules.status) {
		case 'success':
			if (activeModules.data.data != null) {
                const filtered = WEB_MODULES.filter((webModule) => {
                    // @ts-expect-error TypeScript doesn't infer that this code will only run if we know it isn't null...
                    return Object.keys(activeModules.data.data.input).includes(webModule.id);
                });

                return <>
                    <Tabs.Root defaultValue={filtered[0]?.id} mb='3'>
                        <Tabs.List mb='3'>
                            {(filtered.map(f => {
                                return <Tabs.Trigger value={f.id} key={f.id}>
                                    {f.friendlyName}
                                </Tabs.Trigger>
                            }))}
                        </Tabs.List>
                        <Box>
                            {(filtered.map(f => {
                                return <Tabs.Content key={f.id} value={f.id}>
                                    <f.component onHistory={onHistory}/>
                                </Tabs.Content>
                            }))}
                        </Box>
                    </Tabs.Root>

                    <Flex direction='row' justify='between' align='center'>
                        <Heading size='6' mb='1'>
                            History
                        </Heading>
                        <Button variant='ghost' onClick={() => {setHistory([])}}>Clear</Button>
                    </Flex>
                    
                    <Separator size='4' mb='3' />
                        
                    <Flex direction='column-reverse' gap='3'>
                        {(history.map((w, i) => (
                            <Flex key={i} direction='column'>
                                <Text size='2' color='gray'>
                                    {TIME_FORMAT.format(w.ts)}
                                </Text>
                                <Card>
                                    {w.words}
                                </Card>
                            </Flex>
                        )))}
                    </Flex>
                </>
			} else {
				switch((activeModules.data.error.value as any).code) {
					default:
						throw activeModules.data.error.value;
				}
			}
		case 'pending':
			// TODO: Skeleton
			return <Spinner />
		case 'error':
			throw activeModules.error;
	}
}