// pages/withdrawals.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../../components/layout/dashboard';
import Loader from '../../../components/loaders/loader';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filters, setFilters] = useState({
    user: '',
    status: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, [filters]);

  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/withdrawals', { params: filters });
      setWithdrawals(response.data);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  if (isLoading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  return (
    <div>
      <div className="p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center space-x-2">
            <span>Withdrawals</span>
          </h1>
          <div className="flex space-x-2">
            <input
              type="text"
              name="user"
              placeholder="Filter by user"
              className="border border-gray-300 dark:border-zinc-700 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
              onChange={handleFilterChange}
            />
            <select
              name="status"
              className="border border-gray-300 dark:border-zinc-700 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
              onChange={handleFilterChange}
            >
              <option value="">Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 overflow-x-auto dark:bg-zinc-800 bg-white shadow-lg rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader className="text-left">Usuario</TableHeader>
              <TableHeader className="text-left">Monto</TableHeader>
              <TableHeader className="text-left">Estado</TableHeader>
              <TableHeader className="text-left">Fecha</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {withdrawals.length > 0 ? (
              withdrawals.map((withdrawal, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  <TableCell className="font-medium">{withdrawal.user}</TableCell>
                  <TableCell>${withdrawal.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        withdrawal.status === 'approved'
                          ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200'
                          : withdrawal.status === 'rejected'
                          ? 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200'
                          : 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200'
                      }`}
                    >
                      {withdrawal.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(withdrawal.date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 dark:text-gray-400">
                  No hay datos para mostrar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
