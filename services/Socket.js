import sessionMiddleware from '../config/session.js';
import { Server as SocketServer } from 'socket.io';

class Socket {
  static init = async (server) => {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
      },
      allowEIO3: true,
    });

    this.io.use((socket, next) => {
      sessionMiddleware(socket.request, {}, next);
    });

    this.io.on('connection', this.handleConnect);
  };

  static handleConnect = (client) => {
    const session = client.request.session;

    if (!session || !session.user) {
      return client.disconnect(true);
    }

    const { id } = session.user;

    client.join(`user_${id}`);

    console.log(`User ${id} connected`);

    client.on('disconnect', () => {
      console.log(`User ${id} disconnected`);
    });
  };

  static emit = (room, message, type = 'new_message') => {
    this.io.to(room).emit(type, message);
  };
}

export default Socket;