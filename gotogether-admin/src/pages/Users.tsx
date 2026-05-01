import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';

type User = {
  _id: string;
  name: string;
  phone: string;
  createdAt: string;
  totalRides: number;
  rating: number;
  status: string;
};

const columnHelper = createColumnHelper<User>();

const MOCK_USERS: User[] = [
  { _id: '1', name: 'John Doe', phone: '+91 9876543210', createdAt: '2026-04-15', totalRides: 42, rating: 4.8, status: 'verified' },
  { _id: '2', name: 'Jane Smith', phone: '+91 8765432109', createdAt: '2026-04-16', totalRides: 15, rating: 4.5, status: 'banned' },
];

export function Users() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: users = MOCK_USERS } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => Promise.resolve(MOCK_USERS),
  });

  const columns = [
    columnHelper.accessor('name', { header: 'Name', cell: info => info.getValue() }),
    columnHelper.accessor('phone', { header: 'Phone', cell: info => info.getValue() }),
    columnHelper.accessor('createdAt', { header: 'Joined Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
    columnHelper.accessor('totalRides', { header: 'Total Rides', cell: info => info.getValue() }),
    columnHelper.accessor('rating', { header: 'Rating', cell: info => `⭐ ${info.getValue()}` }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.getValue() === 'verified' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {info.getValue().toUpperCase()}
        </span>
      )
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">View</Button>
          <Button variant="destructive" size="sm">Ban</Button>
        </div>
      ),
    })
  ];

  const table = useReactTable({
    data: users.filter(u => statusFilter === 'all' ? true : u.status === statusFilter),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
        <Button variant="outline">Export CSV</Button>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          placeholder="Search by name or phone..."
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
