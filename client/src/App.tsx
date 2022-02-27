import React, { useState, ChangeEventHandler, KeyboardEventHandler } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const App = () => {
  const [text, setText] = useState('');

  const changeHandler: ChangeEventHandler = (e) => {
    const value = (e.target as HTMLInputElement).value;

    socket.emit('change', value);
    setText(value);
  };

  const keyUpHandler: KeyboardEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const position = target.selectionStart;
  };

  return (
    <div className="App">
      <textarea
        onChange={changeHandler}
        onKeyUp={keyUpHandler}
        value={text}
        cols={80}
        rows={40}
      ></textarea>
    </div>
  );
};

export default App;
