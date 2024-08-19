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
            { text: `Can you create a summary in the form of bullet points from this document. 
            Of course, if the document seems like it is just a vocab list, then simply just provide the list of vocabulary in your response.
            However, if it is not, then write notes as if you were a teacher who was giving these notes to students to learn.
            Be sure to make your points cover all topics, but do not make a note about every piece of information.
            Additionally, if any equations are there, be sure to note them down in your notes as well.
            Do not add anything extra other than the notes. For example, do not add "sure here are the notes for you:" in your response.` }
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
            Make sure the summary does not exceed the length of the 800 words and the length of the text in the document.
            Do not add anything extra other than the summary. For example, do not add "sure here is a summary for you:" in your response.` }
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

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
