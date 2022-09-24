import React from 'react';
import { useRef, useState, useEffect, useCallback} from "react";
import Webcam from "react-webcam";
import * as faceapi from 'face-api.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';




export const Top = () => {
    //show all cameras by deviceid
    const [deviceId, setDeviceId] = React.useState<string>("");
    const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);
    const videoConstraints = {
        width: 720,
        height: 360,
        facingMode: "user",
        deviceId: deviceId

    };

    const handleDevices = (mediaDevices:MediaDeviceInfo[]) => {
        setDevices(mediaDevices.filter((item) => item.kind === "videoinput"));
    };



    React.useEffect(
        () => {
            navigator.mediaDevices.enumerateDevices().then(handleDevices);
        },
        [handleDevices]
    );





    const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
    const webcamRef = useRef<Webcam>(null);

    //face-api model
    const [expressions, setExpressions] = React.useState({
        angry: 0,
        disgusted: 0,
        fearful: 0,
        happy: 0,
        neutral: 0,
        sad: 0,
        surprised: 0
    });
    const [modelsLoaded, setModelsLoaded] = React.useState<boolean>(false);
    const loadModels = async () => {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'),
          ]).then(() => {
            faceDetection();
          })
    }

    
    const faceDetection = () => {
        setInterval(async () => {
            if(webcamRef.current) {
                const webcamCurrent = webcamRef.current as any;
                if(webcamCurrent.video.readyState === 4) {
                    const video = webcamCurrent.video;
                    const detections = await faceapi.detectAllFaces
                        (video,new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceExpressions();
                    if(detections.length > 0) {
                        const exp = detections[0].expressions;
                        console.log(exp);
                        setExpressions(exp);
                        const nextChartData = defaultChartData;
                        const data = [
                            exp.angry ,
                            exp.disgusted ,
                            exp.fearful ,
                            exp.happy ,
                            exp.neutral ,
                            exp.sad ,
                            exp.surprised
                        ];
                        for(var i:number = 0;i < 7;++i ) {
                            nextChartData[i].data = data[i];
                        }
                        setChartData(nextChartData);
                    }
                }
            }

        },1000);


    };

    useEffect(() => {
        loadModels();
    },[]);

    //chart settings

    const labels:string[] = ["angry" ,"disgusted", "fearful", "happy", "neutral", "sad", "surprised"];
    const defaultChartData = [
        {
          expression: 'angry',
          data:0,
          fullMark: 1,
          index: 0
        },
        {
            expression: 'disgusted',
            data:0,
            fullMark: 1,
            index: 1
        },
        {
            expression: 'fearful',
            data:0,
            fullMark: 1,
            index: 2
        },
        {
            expression: 'happy',
            data:0,
            fullMark: 1,
            index: 3
        },
        {
            expression: 'neutral',
            data:0,
            fullMark: 1,
            index: 4
        },
        {
            expression: 'sad',
            data:0,
            fullMark: 1,
            index: 5
        },
        {
            expression: 'surprised',
            data:0,
            fullMark: 1,
            index: 6
        },
      ];
    const [chartData, setChartData] = React.useState(defaultChartData);


    return (
        <>
        <header>
            <h1>表情評価</h1>
        </header>
        {isCaptureEnable || (
            <button onClick={() => setCaptureEnable(true)}>開始</button>
        )}
        {isCaptureEnable && (
            <>
            <div>
                <button onClick={() => setCaptureEnable(false)}>終了</button>
            </div>
            <div>
                <Webcam
                audio={false}
                width={540}
                height={360}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                />
            </div>
            <div>
                {devices.map((device, key) => (
                <button
                    key={device.deviceId}
                    onClick={() => setDeviceId(device.deviceId)}
                >
                    {device.label || `Device ${key + 1}`}
                </button>
                ))}
            </div>
            <div style={{height:"200px",width:"60%"}}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                width={500}
                height={300}
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="expression" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="data" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
                
            </div>
            </>
        )}

        </>
    );
}

export default Top;