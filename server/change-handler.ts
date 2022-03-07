import { Socket } from 'socket.io';

enum ChangeDataType {
  INSERT,
  DELETE,
  REPLACE,
}

interface ChangeData {
  position: number;
  type: ChangeDataType;
  text: string;
}

const changeHandler = (socket: Socket, data: ChangeData) => {
  socket.broadcast.emit('change', { ...data, source: socket.id });
};

export default changeHandler;
