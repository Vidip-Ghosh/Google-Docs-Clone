const mongoose = require('mongoose');
const Document = require('./Document');
// https://docs-frontend-seven.vercel.app
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost/google-docs-clone")
var port = process.env.PORT || 3001;
const io = require("socket.io")(port, {
    cors: {
        // origin: "https://docs-frontend-seven.vercel.app",
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
})
const defaultValue = "";
io.on('connection', socket => {
    socket.on('get-document', async documentId => {
        const document = await findOrCreateDocument(documentId);
        // const data = "";
        socket.join(documentId);
        socket.emit('load-document', document.data);

        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta)
        })
        socket.on('save-document', async data => {
            await Document.findByIdAndUpdate(documentId, { data })
        })
    })
})

async function findOrCreateDocument(id) {
    if (id == null) {
        return;
    }
    const docs = await Document.findById(id)
    if (docs) {
        return docs
    }
    return Document.create({ _id: id, data: defaultValue })
}