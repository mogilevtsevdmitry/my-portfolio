import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { BlogListPage } from '@/pages/BlogListPage';
import { BlogEditorPage } from '@/pages/BlogEditorPage';
import { ContactsPage } from '@/pages/ContactsPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/blog" replace />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/new" element={<BlogEditorPage />} />
          <Route path="/blog/:id" element={<BlogEditorPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/blog" replace />} />
    </Routes>
  );
}
