import React, { useEffect, useCallback, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import "./styles.css";
import { io } from "socket.io-client";
import { useParams } from 'react-router';

const toolbarOptions = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    //[{ font: ["Arial","Times","Georgia","Courier","Times New Roman","Courier New"] }],
    ["bold", "italic", "underline", "strike", 'blockquote'],
    [{ size: ['small', false, 'large', 'huge'] }],
    //    [{size: [false,"10px", "15px", "18px", "20px", "32px", "54px"]}],
    [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" }
    ],
    ["link", "image", "formula", "video"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    ["clean"],
]

//Use Ref hook does not cause an item to re render. useRef() returns only one item

export default function TextEditor() {
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();
    const { id: documentId } = useParams();
    // useParams allows us to access the parameters of the current URL.

    useEffect(() => {
        // const sckt = io('http://localhost:3001')
        const sckt = io('https://docs-backend-production.up.railway.app')

        setSocket(sckt);
        return () => {
            sckt.disconnect();
        }
    }, [])

    useEffect(() => {
        if (socket == null || quill == null) {
            return;
        }
        socket.once('load-document', document => {
            quill.setContents(document); //getContents-> retrieves the content of the editor
            quill.enable(); //sets the ability for the user to edit
        })
        socket.emit('get-document', documentId);
    }, [socket, quill, documentId])

    useEffect(() => {
        if (socket == null || quill == null) {
            return;
        }
        const interval = setInterval((document) => {
            socket.emit('save-document', quill.getContents());
        }, 2000)
        return () => {
            clearInterval(interval);
        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) {
            return;
        }
        const handler = delta => {
            quill.updateContents(delta);
        }
        socket.on('receive-changes', handler);
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) {
            return;
        }
        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') //Who made the changes->user or server
            {
                return;
            }
            socket.emit('send-changes', delta);
        }
        quill.on('text-change', handler)
        return () => {
            quill.off('text-change', handler)
        }
    }, [socket, quill])

    // const wrapperRef = useRef();

    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return

        wrapper.innerHTML = ""
        const editor = document.createElement("div")
        wrapper.append(editor)
        const q = new Quill(editor, {
            theme: "snow",
            modules: { toolbar: toolbarOptions },
        })
        q.disable()
        q.setText("Loading...")
        setQuill(q)
    }, [])
    return <div className = "container"
    ref = { wrapperRef } > </div>
}