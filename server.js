// server.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const fs = require('fs'); // <-- NEU: Das File System Modul importieren
const path = require('path'); // <-- NEU: Das Path Modul importieren

const app = express();
const port = 3000;

// Gemini-Client initialisieren
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- NEUER TEIL START ---
// Den System-Prompt aus der .txt-Datei synchron einlesen
// 'utf-8' sorgt dafür, dass wir einen String und keinen Datenpuffer bekommen.
let bernhardPrompt;
try {
    const promptFilePath = path.join(__dirname, 'prompt.txt');
    bernhardPrompt = fs.readFileSync(promptFilePath, 'utf-8');
} catch (error) {
    console.error("Fehler beim Lesen der prompt.txt:", error);
    console.error("Stellen Sie sicher, dass die Datei 'prompt.txt' im Hauptverzeichnis existiert.");
    process.exit(1); // Den Server beenden, wenn der Prompt nicht geladen werden kann.
}
// --- NEUER TEIL ENDE ---


app.use(express.static('public'));
app.use(express.json());

app.post('/api/bernard', async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Ein Thema wird benötigt.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Der Prompt wird jetzt aus der Variable verwendet, die aus der Datei geladen wurde
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: bernhardPrompt }],
        },
        {
            role: "model",
            parts: [{ text: "Verstanden. Die Sinnlosigkeit kann beginnen."}]
        }
      ],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(topic);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Fehler bei der Anfrage an die Gemini API:', error);
    res.status(500).json({ error: 'Der Geist in der Maschine konnte nicht antworten.' });
  }
});

app.listen(port, () => {
  console.log(`Bernard.ai (mit Gemini) läuft auf http://localhost:${port}`);
  console.log("System-Prompt erfolgreich aus 'prompt.txt' geladen.");
});