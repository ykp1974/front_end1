import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RecordListPage from '../pages/RecordListPage';
import RecordFormPage from '../pages/RecordFormPage';
import RecordDetailPage from '../pages/RecordDetailPage';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/records" element={<RecordListPage />} />
        <Route path="/records/new" element={<RecordFormPage />} />
        <Route path="/records/:id" element={<RecordDetailPage />} />
        <Route path="*" element={<Navigate to="/records" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
