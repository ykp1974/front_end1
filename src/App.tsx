import React from 'react';
import AppRouter from './router/AppRouter';

const App: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '960px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>投資意思決定ログ</h1>
      </header>
      <main>
        <AppRouter />
      </main>
    </div>
  );
};

export default App;
