import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ClipboardList,
  Clock,
  PlayCircle,
  CheckCircle2,
  PlusCircle,
  Film,
  Trash2,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const FILM_SIZES_KEY = 'crystal_film_sizes';
const ASSIGNED_KEY = 'crystal_assigned_sheets';

function getAssignedSheets() {
    try {
        const saved = localStorage.getItem(ASSIGNED_KEY);
        const all = saved ? JSON.parse(saved) : [];
        // Only count root assignments (not reassigned children)
        return all.filter((a) => !a.reassignedFrom);
    } catch {
        return [];
    }
}

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const [sheets, setSheets] = useState([]);
  const [showFilmSizes, setShowFilmSizes] = useState(false);
  const [filmSizes, setFilmSizes] = useState(() => {
    try {
      const saved = localStorage.getItem(FILM_SIZES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newSize, setNewSize] = useState('');

  useEffect(() => {
    const load = () => setSheets(getAssignedSheets());
    load();
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, []);

  useEffect(() => {
    localStorage.setItem(FILM_SIZES_KEY, JSON.stringify(filmSizes));
  }, [filmSizes]);

  const handleAddSize = (e) => {
    e.preventDefault();
    const trimmed = newSize.trim();
    if (!trimmed) return;
    if (filmSizes.includes(trimmed)) {
      toast.error('This film size already exists.');
      return;
    }
    setFilmSizes((prev) => [...prev, trimmed]);
    setNewSize('');
    toast.success(`Film size "${trimmed}" added!`);
  };

  const handleDeleteSize = (size) => {
    setFilmSizes((prev) => prev.filter((s) => s !== size));
    toast.success(`Film size "${size}" removed.`);
  };

  const totalCount = sheets.length;
  const pendingCount = sheets.filter((a) => a.status === 'pending').length;
  const acceptedCount = sheets.filter((a) => a.status === 'accepted' && !a.submitted).length;
  const submittedCount = sheets.filter((a) => a.submitted).length;

  const statCards = [
    {
      title: 'Total Assigned',
      value: totalCount,
      icon: ClipboardList,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Response',
      value: pendingCount,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'In Progress',
      value: acceptedCount,
      icon: PlayCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Submitted',
      value: submittedCount,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-500">
            Here&apos;s an overview of your work orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilmSizes(!showFilmSizes)}
            className="gap-1.5"
          >
            <Film className="h-4 w-4" />
            Manage Film Size
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/company/orders/create" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Manage Film Size Section */}
      {showFilmSizes && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-blue-600" />
                  Manage Film Sizes
                </CardTitle>
                <CardDescription>Add film sizes that will appear as options in the requisition sheet</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowFilmSizes(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Form */}
            <form onSubmit={handleAddSize} className="flex gap-2 mb-4">
              <Input
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="e.g., 10x40, 10x48, 4x10..."
                className="flex-1"
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 gap-1.5">
                <PlusCircle className="h-4 w-4" />
                Add
              </Button>
            </form>

            {/* Film Size List */}
            {filmSizes.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No film sizes added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filmSizes.map((size) => (
                  <div
                    key={size}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => handleDeleteSize(size)}
                      className="text-blue-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Assignments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Assignments</CardTitle>
          <Button variant="ghost" asChild>
            <Link to="/company/order-status">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {sheets.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No assignments yet</p>
              <Button asChild className="mt-4">
                <Link to="/company/orders/create">Create your first order</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sheets.slice(0, 5).map((sheet) => (
                <div
                  key={sheet.id}
                  className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-800">{sheet.sheet?.formData?.jobNo || '—'}</p>
                    <p className="text-sm text-slate-500">
                      Vendor: {sheet.vendorName || '—'} • RS: {sheet.sheet?.formData?.rsNo || '—'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    sheet.submitted ? 'bg-green-100 text-green-800' :
                    sheet.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                    sheet.status === 'declined' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {sheet.submitted ? 'Submitted' :
                     sheet.status === 'accepted' ? 'In Progress' :
                     sheet.status === 'declined' ? 'Declined' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
