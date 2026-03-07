import { TransactionProvider } from '../../../lib/transaction-context';

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return <TransactionProvider>{children}</TransactionProvider>;
}
