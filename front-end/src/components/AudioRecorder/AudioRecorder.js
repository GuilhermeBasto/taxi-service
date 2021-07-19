/* eslint-env browser */
import React from "react";
import MicLine from "../../assets/mic-line.svg";
import MicLineOff from "../../assets/mic-off-line.svg";
import "./../../pages/Dashboard/Dashboard.css";
import { apiUrl } from "../../core/constants";

const audioType = "audio/wav";

class AudioRecorder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
      responseData: "",
    };
  }

  async uploadFileToS3(presignedPostData, file) {
    const formData = new FormData();
    Object.keys(presignedPostData.fields).forEach((key) => {
      formData.append(key, presignedPostData.fields[key]);
    });

    formData.append("file", file);

    await fetch(presignedPostData.url, {
      method: "POST",
      body: formData,
    })
      .then((response) =>
        response.status === 204
          ? console.log("File uploaded")
          : console.log("File not uploaded")
      )
      .catch(() => console.log("error in upload"));
  }

  async getPresignedPostData(selectedFile) {
    const auth = localStorage.getItem("token");

    const body = {
      bucketName: "taxi-destinations",
      objectName: selectedFile.name,
    };

    await fetch(`${apiUrl}/upload`, {
      mode: "cors",
      method: "POST",
      headers: {
        token: JSON.stringify({ token: auth }),
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => this.setState({ responseData: data.body }))
      .catch(() => console.log("error in get presigned post"));
  }

  async setMicrophone() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.mediaRecorder = new MediaRecorder(stream);

    // init data storage for video chunks
    this.chunks = [];
    // listen for data from media recorder
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };
  }

  async startRecording(e) {
    e.preventDefault();

    await this.setMicrophone();
    // wipe old data chunks
    this.chunks = [];
    // start recorder with 10ms buffer
    this.mediaRecorder.start(10);
    // say that we're recording
    this.setState({ recording: true });
  }

  stopRecording(e) {
    e.preventDefault();
    // stop the recorder
    this.mediaRecorder.stop();
    // say that we're not recording
    this.setState({ recording: false });
    // save the video to memory
    this.saveAudio();
  }

  async convertAudioToMp3() {
    const auth = localStorage.getItem("token");
    await fetch(`${apiUrl}/convert-audio`, {
      method: "PUT",
      headers: {
        token: JSON.stringify({ token: auth }),
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .catch(() => console.log("error converting audio"));
  }

  async startTranscribeJob() {
    const auth = localStorage.getItem("token");
    fetch(`${apiUrl}/speech-to-text`, {
      mode: "cors",
      method: "POST",
      headers: {
        token: JSON.stringify({ token: auth }),
      },
      body: JSON.stringify({
        url: "https://taxi-destinations.s3.amazonaws.com/out.mp3",
      }),
    })
      .then((response) => response.json())
      .then((res) => this.props.jobId(res.body.jobId))
      .catch((err) => console.error("error in start transcribe", err));
  }

  async saveAudio() {
    // convert saved chunks to blob
    const blob = new Blob(this.chunks, { type: audioType });
    const selectedFile = new File([blob], "audio.wav", { type: audioType });

    await this.getPresignedPostData(selectedFile);
    await this.uploadFileToS3(this.state.responseData, selectedFile);
    await this.convertAudioToMp3();
    await this.startTranscribeJob();
  }

  render() {
    const { recording } = this.state;

    return (
      <span style={{ display: "contents" }}>
        {!recording && (
          <div className="record-div" onClick={(e) => this.startRecording(e)}>
            <img alt="" className="mic-icon" src={MicLineOff}></img>
            <span className="destiny-text">Destino</span>
          </div>
        )}
        {recording && (
          <div
            className="record-div draw"
            onClick={(e) => this.stopRecording(e)}
          >
            <img alt="" className="mic-icon" src={MicLine}></img>
            <span className="destiny-text">Destino</span>
          </div>
        )}
      </span>
    );
  }
}
export default AudioRecorder;
