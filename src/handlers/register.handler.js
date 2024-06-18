import { addUser } from '../models/user.model.js';
import { handleConnection, handleDisconnect, handlerEvent } from './helper.js';

const registerHandler = (io) => {
  io.on('connection', (socket) => {
    const userId = '';
    addUser({ uuid: userUUID, socketId: socket.id });
    handleConnection(socket, userUUID);

    socket.on('event', (data) => handlerEvent(io, socket, data));
    socket.on('disconnect', (socket) => {
      handleDisconnect(socket, userUUID);
    });
  });
};

export default registerHandler;
