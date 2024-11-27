import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Catalogo from './components/Catalogo';
import './App.css';

function App() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  return (
    <div>
      <Navbar 
        onOpenLogin={() => setShowLoginDialog(true)}
        onOpenRegister={() => setShowRegisterDialog(true)}
      />
      <main>
        <Catalogo 
          showLoginDialog={showLoginDialog}
          setShowLoginDialog={setShowLoginDialog}
          showRegisterDialog={showRegisterDialog}
          setShowRegisterDialog={setShowRegisterDialog}
        />
      </main>
    </div>
  );
}

export default App;