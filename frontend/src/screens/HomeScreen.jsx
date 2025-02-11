import { useState } from "react";
import { Container, Button, Form, Alert, Spinner } from "react-bootstrap";
import { FaPlay, FaTrash, FaUpload } from "react-icons/fa";
import axios from "axios";

const HomeScreen = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioSrc, setAudioSrc] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle file selection
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioSrc(URL.createObjectURL(file));
      setMessage("");
    }
  };

  // Handle file upload to backend
  const handleUpload = async () => {
    if (!audioFile) {
      setConvertedText("Please select an audio file first.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioFile);

    try {
      setConvertedText("Uploading and transcribing...");
      const { data } = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setConvertedText(data.transcription);
    } catch (error) {
      setConvertedText("Upload failed. Try again.");
    }
  };

  // Handle clear output
  const handleClear = () => {
    setConvertedText("");
  };

  return (
    <Container className="mt-4 text-center">
      <h2 className="mb-4">Speech Lab</h2>

      {message && <Alert variant="info">{message}</Alert>}

      {/* Upload Audio */}
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label className="fw-bold">Upload Audio File</Form.Label>
        <div className="d-flex justify-content-center align-items-center gap-2">
          <Form.Control
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
          />
          <FaUpload size={24} color="gray" />
        </div>
      </Form.Group>

      {/* Upload Button */}
      <Button
        variant="primary"
        className="mb-3"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <FaUpload className="me-2" />
        )}
        Upload
      </Button>

      {/* Audio Player */}
      {audioSrc && (
        <div className="mb-3">
          <audio controls src={audioSrc} className="w-100"></audio>
        </div>
      )}

      {/* Converted Text Output */}
      <Form.Group controlId="convertedText">
        <Form.Label className="fw-bold">Converted Text</Form.Label>
        <Form.Control as="textarea" rows={4} value={convertedText} readOnly />
      </Form.Group>

      {/* Clear Button */}
      <Button variant="danger" className="mt-3" onClick={handleClear}>
        <FaTrash className="me-2" /> Clear
      </Button>
    </Container>
  );
};

export default HomeScreen;
