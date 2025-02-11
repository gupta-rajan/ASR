import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
import axios from 'axios';  // To send file to the model
import FormData from 'form-data';
import fs from 'fs';
import connectDB from './config/db.js';
import Audio from './models/audioModel.js';

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Upload & Transcribe Route
app.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Save to MongoDB
    const newAudio = new Audio({ filename: req.file.filename, path: req.file.path });
    await newAudio.save();

    // Send file to transcription model
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    const response = await axios.post('http://127.0.0.1:8000/transcribe', formData, {
      headers: { ...formData.getHeaders() },
    });

    const transcription = response.data.transcription;

    res.status(201).json({
      message: "File uploaded and transcribed",
      file: req.file.filename,
      transcription,
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));