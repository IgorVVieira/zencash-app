import DashboardLayout from '../dashboard/components/DashboardLayout';
import AuthGuard from '../../lib/auth-guard';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
