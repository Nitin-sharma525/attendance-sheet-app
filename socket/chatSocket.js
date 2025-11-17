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
      time: new Date().toISOString(),
    };

    
    io.to(data.receiverUUID).emit("receiveMessage", msg);
    io.to(senderUUID).emit("receiveMessage", msg); 

    console.log("Message Sent:", msg);
  });
};
