module.exports = (io, socket) => {
  const user = socket.data.user;
  const senderUUID = user.id;

  socket.emit("system", `Welcome ${user.email}`);
  socket.join(senderUUID);

  
  socket.on("sendMessage", (data) => {
    if (!data.receiverUUID) {
      return socket.emit("system", "receiverUUID is required");
    }

    const msg = {
      senderUUID,
      receiverUUID: data.receiverUUID,
      message: data.message || "",
      fileName: data.fileName || null,
      fileType: data.fileType || null,
      fileData: data.fileData || null, 
      isChunked: false,
      time: new Date().toISOString(),
    };

    io.to(data.receiverUUID).emit("receiveMessage", msg);
    io.to(senderUUID).emit("receiveMessage", msg);

    console.log("Standard Message Sent:", msg.fileName || msg.message);
  });

  
  const fileChunks = {};

  socket.on("sendChunk", (data) => {
    const { receiverUUID, fileName, fileType, chunk, isLast } = data;

    if (!fileChunks[fileName]) fileChunks[fileName] = [];
    fileChunks[fileName].push(chunk);

    if (isLast) {
      const finalBuffer = Buffer.concat(fileChunks[fileName]);
      delete fileChunks[fileName];

      const msg = {
        senderUUID,
        receiverUUID,
        fileName,
        fileType,
        fileData: finalBuffer,
        isChunked: true,
        time: new Date().toISOString(),
      };

      io.to(receiverUUID).emit("receiveChunkedFile", msg);
      io.to(senderUUID).emit("receiveChunkedFile", msg);

      console.log("Chunked File Finalized:", fileName);
    }
  });
};
