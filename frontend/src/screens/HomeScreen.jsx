import { useState, useRef } from "react";
import { Container, Button, Form, Alert, Spinner, Dropdown } from "react-bootstrap";
import axios from "axios";
import RecordRTC from "recordrtc";

const HomeScreen = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioSrc, setAudioSrc] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [language, setLanguage] = useState("Kannada"); // Default language
  const recorderRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      recorderRef.current = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/mp3",
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
        bitrate: 96000,
      });

      recorderRef.current.startRecording();
      setRecording(true);
    } catch (error) {
      setMessage("Error accessing microphone");
      console.error("Recording Error:", error);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        const audioBlob = recorderRef.current.getBlob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const file = new File([audioBlob], `recording_${Date.now()}.mp3`, { type: "audio/mp3" });

        setAudioFile(file);
        setAudioSrc(audioUrl);
      });
      setRecording(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioSrc(URL.createObjectURL(file));
    }
  };

  const uploadAudio = async () => {
    if (!audioFile) {
      setConvertedText("No audio file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("language", language); // Pass language to backend

    try {
      setConvertedText("Uploading and transcribing...");
      setUploading(true);

      const { data } = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setConvertedText(data.transcription);
    } catch (error) {
      setConvertedText("Upload failed. Try again.");
      console.error("Upload Error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container className="mt-4 text-center">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-4">Shabdavedi Lab</h2>
        <Dropdown>
          <Dropdown.Toggle variant="secondary">{language}</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setLanguage("Kannada")}>Kannada</Dropdown.Item>
            <Dropdown.Item onClick={() => setLanguage("Hindi")}>Hindi</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {message && <Alert variant="info">{message}</Alert>}

      <Button variant={recording ? "danger" : "primary"} onClick={recording ? stopRecording : startRecording} className="mb-3">
        {recording ? "Stop Recording" : "Start Recording"}
      </Button>

      <Form.Group controlId="fileUpload" className="mb-3">
        <Form.Label className="fw-bold">Upload an Audio File</Form.Label>
        <Form.Control type="file" accept="audio/mp3,audio/wav,audio/*" onChange={handleFileUpload} />
      </Form.Group>

      {audioSrc && (
        <div className="mb-3">
          <audio controls src={audioSrc} className="w-100"></audio>
        </div>
      )}

      {audioFile && (
        <Button variant="primary" className="mb-3" onClick={uploadAudio} disabled={uploading}>
          {uploading ? <Spinner animation="border" size="sm" /> : "Upload"}
        </Button>
      )}

      <Form.Group controlId="convertedText">
        <Form.Label className="fw-bold">Converted Text</Form.Label>
        <Form.Control as="textarea" rows={4} value={convertedText} readOnly />
      </Form.Group>
    </Container>
  );
};

export default HomeScreen;