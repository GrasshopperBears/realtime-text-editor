import React, { useState, ChangeEventHandler, useEffect } from 'react';
import io from 'socket.io-client';

enum ChangeDataType {
  INSERT,
  DELETE,
  REPLACE,
}

interface SocketChangeData {
  source: string;
  position: number;
  type: ChangeDataType;
  text?: string;
  length?: number;
}

const socket = io('http://localhost:4000');

const EVENT_TYPE_DELETE = ['deleteContentBackward', 'deleteContentForward', 'deleteByCut'];
const EVENT_TYPE_INSERT = ['insertText', 'insertFromPaste'];

const App = () => {
  const [textareaText, setTextareaText] = useState('');

  useEffect(() => {
    socket.on('change', socketChangeHandler);
    return () => {
      socket.removeAllListeners('change');
    };
  }, [textareaText]);

  const socketChangeHandler = (data: SocketChangeData) => {
    const { source, text, position: newTextPosition, length = 0, type } = data;
    if (source === socket.id) return;

    if (type === ChangeDataType.DELETE) {
      setTextareaText(
        textareaText.slice(0, newTextPosition) + textareaText.slice(newTextPosition + length),
      );
    } else if (type === ChangeDataType.INSERT) {
      setTextareaText(
        textareaText.slice(0, newTextPosition) +
          text +
          textareaText.slice(newTextPosition + length),
      );
    }
  };

  const getChangedData = (
    eventType: string,
    position: number,
    newText: string,
  ): SocketChangeData | null => {
    if (EVENT_TYPE_DELETE.includes(eventType)) {
      return {
        source: socket.id,
        type: ChangeDataType.DELETE,
        position,
        length: textareaText.length - newText.length,
      };
    } else if (EVENT_TYPE_INSERT.includes(eventType)) {
      const length = newText.length - textareaText.length;
      const insertPosition = position - length;
      return {
        source: socket.id,
        type: ChangeDataType.INSERT,
        position: insertPosition,
        length,
        text: newText.slice(insertPosition, insertPosition + length),
      };
    }

    return null;
  };

  const changeHandler: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    const currentPosition = target.selectionStart ?? 0;
    const eventType: string = (e.nativeEvent as any).inputType;

    const changedData = getChangedData(eventType, currentPosition, value);
    console.log(changedData);
    /**
     * e.navtiveEvent.inputType 종류 (string)
     *
     * 삭제
     * deleteContentBackward (백스페이스)
     * deleteContentForward (delete)
     * deleteByCut
     *
     * 수정
     * insertText
     * insertFromPaste
     * historyUndo
     * historyRedo
     */

    socket.emit('change', changedData);
    setTextareaText(value);
  };

  return (
    <div className="App">
      <textarea onChange={changeHandler} value={textareaText} cols={80} rows={40}></textarea>
    </div>
  );
};

export default App;
