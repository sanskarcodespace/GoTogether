import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';

type Ride = {
  _id: string;
  provider: string;
  route: string;
  vehicle: string;
  status: string;
  createdAt: string;
  passengers: number;
  fare: number;
};

const columnHelper = createColumnHelper<Ride>();

const MOCK_RIDES: Ride[] = [
  { _id: 'RIDE-1001', provider: 'Amit Kumar', route: 'CP -> Gurgaon', vehicle: 'Car (DL01AB1234)', status: 'active', createdAt: '2026-05-01T10:00:00Z', passengers: 0, fare: 250 },
  { _id: 'RIDE-1002', provider: 'Sanjay Gupta', route: 'Noida -> CP', vehicle: 'Bike (UP16XY9876)', status: 'in_progress', createdAt: '2026-05-01T09:30:00Z', passengers: 1, fare: 120 },
  { _id: 'RIDE-1003', provider: 'Neha Singh', route: 'Dwarka -> Aerocity', vehicle: 'Car (HR26KL5678)', status: 'completed', createdAt: '2026-05-01T08:15:00Z', passengers: 3, fare: 300 },
];

export function Rides() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: rides = MOCK_RIDES } = useQuery({
    queryKey: ['adminRides'],
    queryFn: () => Promise.resolve(MOCK_RIDES),
  });

  const columns = [
    columnHelper.accessor('_id', { header: 'Ride ID', cell: info => <span className="font-mono text-sm">{info.getValue()}</span> }),
    columnHelper.accessor('provider', { header: 'Provider', cell: info => info.getValue() }),
    columnHelper.accessor('route', { header: 'Route', cell: info => info.getValue() }),
    columnHelper.accessor('vehicle', { header: 'Vehicle', cell: info => info.getValue() }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const val = info.getValue();
        let colors = 'bg-gray-100 text-gray-800';
        if (val === 'active') colors = 'bg-blue-100 text-blue-800';
        if (val === 'in_progress') colors = 'bg-yellow-100 text-yellow-800';
        if (val === 'completed') colors = 'bg-green-100 text-green-800';
        if (val === 'cancelled') colors = 'bg-red-100 text-red-800';
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors}`}>{val.toUpperCase().replace('_', ' ')}</span>
      }
    }),
    columnHelper.accessor('createdAt', { header: 'Created At', cell: info => new Date(info.getValue()).toLocaleTimeString() }),
    columnHelper.accessor('passengers', { header: 'Passengers', cell: info => info.getValue() }),
    columnHelper.accessor('fare', { header: 'Fare', cell: info => `₹${info.getValue()}` }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">View</Button>
          <Button variant="destructive" size="sm">Force Cancel</Button>
        </div>
      ),
    })
  ];

  const table = useReactTable({
    data: rides.filter(r => statusFilter === 'all' ? true : r.status === statusFilter),
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
        <h2 className="text-3xl font-bold tracking-tight">Rides Management</h2>
        <Button variant="outline">Export CSV</Button>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          placeholder="Search by provider or Ride ID..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
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
