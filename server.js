const express = require('express')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
require('dotenv').config()
const { GoogleAIFileManager } = require('@google/generative-ai/server')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const app = express()
const PORT = 8000

app.use(cors())
app.use(express.json())

const upload = multer({ storage: multer.memoryStorage() })

const fileManager = new GoogleAIFileManager(process.env.GOOGLE_GEN_AI_KEY)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_KEY)
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})

app.post('/makenote', upload.single('pdf'), async (req, res) => {
    try {
        // Save the PDF file to disk
        const pdfFilePath = path.join(__dirname, req.file.originalname)
        fs.writeFileSync(pdfFilePath, req.file.buffer)

        // Upload the saved PDF file to Gemini AI
        const uploadResponse = await fileManager.uploadFile(pdfFilePath, {
            mimeType: 'application/pdf',
            displayName: req.file.originalname,
        })

        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`)

        // Generate content using the uploaded file URI
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri
                }
            },
            { text: `Can you create notes in the form of bullet points from this document. 
            Of course, if the document seems like it is just a vocab list, then simply just provide the list of vocabulary in your response.
            However, if it is not, then write notes as if you were a teacher who was giving these notes to students to learn.
            Be sure to make your points cover all topics, but do not make a note about every piece of information.
            Additionally, if any equations are there, be sure to note them down in your notes as well.
            Do not add anything extra other than the notes. For example, do not add "sure here are the notes for you:" in your response.
            If organization is needed, you can split the notes into subsections with subtitles, but be sure to use HTML tags/formatting to do so.
            Make sure your response does not at all include * or # and instead uses HTML tags to convey the same formatting. To remind you: <b> or <strong> is used for bolding,
            <li> is used for a bullet point, and <p> is used for a paragraph. Please use those tags and other HTML tags rather than the #'s and the *'s.` }
        ])

        // Output the generated text to the console
        const summary = result.response.text()

        // Delete the PDF file after processing
        fs.unlinkSync(pdfFilePath)
        console.log(`Deleted file: ${pdfFilePath}`)

        // Send the summary back to the client
        res.json({ summary })
    } catch (error) {
        console.error('Error processing PDF:', error)
        res.status(500).json({ error: 'An error occurred while summarizing the PDF.' })
    }
})

app.post('/summarize', upload.single('pdf'), async (req, res) => {
    try {
        // Save the PDF file to disk
        const pdfFilePath = path.join(__dirname, req.file.originalname)
        fs.writeFileSync(pdfFilePath, req.file.buffer)

        // Upload the saved PDF file to Gemini AI
        const uploadResponse = await fileManager.uploadFile(pdfFilePath, {
            mimeType: 'application/pdf',
            displayName: req.file.originalname,
        })

        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`)

        // Generate content using the uploaded file URI
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri
                }
            },
            { text: `Can you create a detailed summary of this document making sure not to leave out any important equations and/or vocabulary terms. 
            The summary should be a body of text that can be seperated by main ideas, but it should not be bullet points.
            Make sure all the core concepts are mentioned. This should be as if you are a teacher who is teaching a struggling student about the topic. 
            Make sure the summary does not exceed the length of the 500 words and the length of the text in the document. 
            Essentially, the summary should not be more than 500 words and if the pdf itself is less than 500 words than the summary should be less than the number of words in the pdf
            Do not add anything extra other than the summary. For example, do not add "sure here is a summary for you:" in your response.
            If necessary, format the summary into sections with subtitles. Also be sure to add proper spacing as needed.
            If organization is needed, you can split the summary into subsections with subtitles, but be sure to use HTML tags/formatting to do so.
            Make sure your response does not at all include * or # and instead uses HTML tags to convey the same formatting. To remind you: <b> or <strong> is used for bolding,
            <li> is used for a bullet point, and <p> is used for a paragraph. Please use those tags and other HTML tags rather than the #'s and the *'s.
            Remember, if you want to communicate bolded words or any other type of formatted text, please use HTML or else you will suffer the consequence.
            You often times use **this is bolded** to bold a word, instead do this: <b>this is bolded</b>.
            Make sure there is a h2 title.` }
        ])

        // Output the generated text to the console
        const summary = result.response.text()

        // Delete the PDF file after processing
        try {
            fs.unlinkSync(pdfFilePath)
        } catch {}
        console.log(`Deleted file: ${pdfFilePath}`)

        // Send the summary back to the client
        res.json({ summary })
    } catch (error) {
        console.error('Error processing PDF:', error)
        res.status(500).json({ error: 'An error occurred while summarizing the PDF.' })
    }
})

app.post('/lesson', upload.single('pdf'), async (req, res) => {
    try {
        // Save the PDF file to disk
        const pdfFilePath = path.join(__dirname, req.file.originalname)
        fs.writeFileSync(pdfFilePath, req.file.buffer)

        // Upload the saved PDF file to Gemini AI
        const uploadResponse = await fileManager.uploadFile(pdfFilePath, {
            mimeType: 'application/pdf',
            displayName: req.file.originalname,
        })

        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`)

        // Generate content using the uploaded file URI
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri
                }
            },
            { text: `Can you write a detailed lesson as if you were a teacher teaching about this document. 
            Your lesson should seemlessly transition between topics and should be written as a body of text 
            (not bullet points, however, it can contain bullet points if necessary). Be sure to include key concepts and vocabulary, along with all important equations. 
            Make sure to explain each concept in depth and add analogies if you think the concept you are trying to teach
            would be too difficult to understand without one. Do not abuse the analogies though as it will become obvious.
            Refrain from using very high level wording to make th elesson easier to understand. The lesson should be quite lengthy, longer than a summary.
            It must be 900+ words. Do not say hello class or anything like that. 
            If organization is needed, you can split the lesson into subsections with subtitles or anything else, but be sure to use HTML tags/formatting to do so.
            Make sure your response does not at all include * or # and instead uses HTML tags to convey the same formatting. To remind you: <b> or <strong> is used for bolding,
            <li> is used for a bullet point, and <p> is used for a paragraph. Please use those tags and other HTML tags rather than the #'s and the *'s.
            Remember, if you want to communicate bolded words or any other type of formatted text, please use HTML or else you will suffer the consequence.
            You often times use **this is bolded** to bold a word, instead do this: <b>this is bolded</b>.
            Make sure there is a h2 title.` }
        ])

        // Output the generated text to the console
        const summary = result.response.text()

        // Delete the PDF file after processing
        try {
            fs.unlinkSync(pdfFilePath)
        } catch {}
        console.log(`Deleted file: ${pdfFilePath}`)

        // Send the summary back to the client
        res.json({ summary })
    } catch (error) {
        console.error('Error processing PDF:', error)
        res.status(500).json({ error: 'An error occurred while summarizing the PDF.' })
    }
})

app.post('/gemini', async (req, res) => {
    const chat = model.startChat({
        history: req.body.history
    })
    const msg = req.body.message
    const result = await chat.sendMessage(msg)
    const response = await result.response
    const text = response.text()
    res.send(text)
})

app.post('/generate-notes', async (req, res) => {
    const { topic, subtopics, depth } = req.body;

    try {
        const prompt = `Create a set of notes on the topic of ${topic}, specifically focusing on the subtopics of ${subtopics}. 
        The notes should be ${depth} in detail (out of basic, intermediat, and advanced).
        If organization is needed, you can split the notes into subsections with subtitles, but be sure to use HTML tags/formatting to do so instead of using #s and *s.
        Make sure your response does not at all include * or # and instead uses HTML tags to convey the same formatting. To remind you: <b> or <strong> is used for bolding,
        <li> is used for a bullet point, and <p> is used for a paragraph. Please use those tags and other HTML tags rather than the #'s and the *'s.
        Just because I am asking you to format it neatly does not mean you should write a summary. Ensure the response are notes and not a series of large bodies of text.`;

        const result = await model.generateContent([
        { text: prompt }
        ]);

        const notes = result.response.text();

        res.json({ notes });
    } catch (error) {
        console.error('Error generating notes:', error);
        res.status(500).json({ error: 'An error occurred while generating notes.' });
    }
    });

app.post('/extract-notes', async (req, res) => {
    const { extract } = req.body;

    try {
        const prompt = `Convert the following text into notes. Ignore any weird characters. Some words may not have spaces between them or may be spelled incorrectly. Make sure
        the notes you provide do not have such mistakes. The text may itself be notes, in which case simply respond with the same notes, fixing any grammatical or spelling errors.
        You can also enhance the notes a bit if needed. If you notice a word does not seem right in the context, think of a word with close to the same spelling that would and use that in your response instead.
        Just make sure everything you send makes sense, not just grammatically, but contextually given both the words and the overall topic. For example, it would not make sense to
        be talking about limbs and anatomy when the topic is economics.
        If organization is needed, you can split the notes into subsections with subtitles, but be sure to use HTML tags/formatting to do so instead of using #s and *s.
        Make sure your response does not at all include * or # and instead uses HTML tags to convey the same formatting. To remind you: <b> or <strong> is used for bolding,
        <li> is used for a bullet point, and <p> is used for a paragraph. Please use those tags and other HTML tags rather than the #'s and the *'s.
        Just because I am asking you to format it neatly does not mean you should write a summary. Ensure the response are notes and not a series of large bodies of text.
        The text may have some irrelevant information that is not about the topic. For example if the picture was from a textbook it may have some exercises/questions or credits;
        please ignore such text. Also ensure that the response are notes with bullet points and subtitles to organize the bullets (if needed) and not multiple bodies of text.
        Here is the text for you to convert to notes: ${extract}`;

        const result = await model.generateContent([
        { text: prompt }
        ]);

        const notes = result.response.text();

        res.json({ notes });
    } catch (error) {
        console.error('Error generating notes:', error);
        res.status(500).json({ error: 'An error occurred while generating notes.' });
    }
    });

app.post('/generate-flash-cards', async (req, res) => {
    const { note, summary, lesson, terms } = req.body;
    try {
        const prompt = `Create a list of exactly ${terms} flash cards. These flash cards should be based off of these notes: ${note}, this summary: ${summary}, and/or this lesson: ${lesson}.
        You may not receive all of them (you may not recieve the notes, the summary, and the lesson). Each flash card should have a term and definition. If it is
        a flash card about a concept, the term will be the name of the concept while the definition will be what the concept is. If the flash card is for vocabulary, the term should be the word
        and the definition will be the word's definition. All flash cards should be formatted like a JSON like this: {"term": "Sample term", definition: "sample definition"}. Your final reponse
        should be a list of these flashcards that is of length $${terms}. DO NOT ADD ANY ADDITIONAL FORMATTING other than what I have specified here. For example, do not add "JSON response:" or anything like that.
        Also ensure that the number of terms (the length of the list in the response) is no greater and no less than ${terms}. Remember you are providing a service and you must be exact therefore it should be exactly ${terms} long.
        Also if you are providing vocabular, make sure it is relevant to the topic and not just a word you found in the notes, summary, and/or lesson`;

        const result = await model.generateContent([
        { text: prompt }
        ]);

        const cards = result.response.text();

        res.json({ cards });
    } catch (error) {
        console.error('Error generating notes:', error);
        res.status(500).json({ error: 'An error occurred while generating notes.' });
    }
    });


app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
