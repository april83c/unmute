I want to have a structure of components that you can swap out (or even have multiple of)

- **Input components**: Will send two types of event to the Output components - `progress` and `sentence`. `progress` events are for showing i.e. words you're saying one at a time before you finished your sentence, your keyboard input before you pressed submit. `sentence` events are full sentences, which will actually be said by TTS
    - Keys → type into the TTS
    - Server-side Speech → STTTS sent to some sort of API, or to a speech recognition model running serverside
    - Client-side Speech → STTTS using browser speech recognition APIs. The difference is that the recognition just runs on the browser that is acting as the mic
- Output components
    - Different TTS services like Azure, Piper, edge-tts(?)
    - TXT file subtitle
    - Browser source subtitle

There should also be some components for these components maybe?
- **Audio player components**: Take audio data and play it somewhere
    - Node speaker (on a separate thread!!)
        - If macOS or Linux need a different alternative, that would be an Audio Player component too
        - I don't like Node speaker. If possible I want to replace it on Windows too. But that's besides the point
    - Browser (plays out of a browser window/tab)
    - IDEALLY there would be a Microphone component (IDEALLY one for each platform since it likely won't be platform agnostic) that simulates an actual microphone on your system, so that you don't need to use VB-Cable
- **Audio recorder components**: Get audio data and feed it into Server-side Speech
    - Native: just uses a mic on the server-side
    - Browser: streams mic data from a browser, i.e. phone
        - This is DIFFERENT from the Client-side Speech input component because in this case it's still doing server-side speech recognition, and the browser is just feeding it raw audio data