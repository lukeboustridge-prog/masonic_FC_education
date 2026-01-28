import React from 'react';
import GameCanvas from './components/GameCanvas';
import { useUser } from '@shared/auth';

function App() {
  const user = useUser();

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 text-white selection:bg-blue-500 selection:text-white">
      <GameCanvas
        userId={user.userId}
        userName={user.name}
        rank={user.rank}
        initiationDate={user.initiationDate}
        isGrandOfficer={user.isGrandOfficer}
      />
    </div>
  );
}

export default App;
