import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Search, Book, Database, Zap, User, Library, Shield,
  LayoutDashboard, Settings, Activity, Clock, LogOut, RefreshCw, Server, Trash2,
  Calendar, DollarSign
} from 'lucide-react';
import { Card, Button, Badge } from '../components/LibraryUI';
import Sidebar from '../components/Sidebar';
import { MetricsCard, SystemLogs } from '../components/DashboardWidgets';
import AddBookModal from '../components/AddBookModal';
import { Plus } from 'lucide-react';

// --- SUB-COMPONENTS (Defined outside to prevent remounting) ---

const LoginScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
    <Card className="w-full max-w-md p-8 text-center space-y-6">
      <div className="flex justify-center mb-4">
        <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/30">
          <Library className="w-8 h-8 text-white" />
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">LMS Portal</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Library Management System</p>
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
          <Badge variant="neutral">Next.js</Badge>
          <Badge variant="neutral">Redis</Badge>
          <Badge variant="neutral">MongoDB</Badge>
          <Badge variant="neutral">OAuth 2.0</Badge>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <Button onClick={() => signIn('google')} className="w-full py-3" icon={User}>
          Sign in with Google
        </Button>
      </div>

      <p className="text-xs text-slate-400 mt-6">
        System secured with OAuth 2.0 Authorization Code Flow
      </p>
    </Card>
  </div>
);

const SearchBar = ({ query, setQuery, loading, searchMetrics }) => (
  <div className="relative">
    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <Search className="w-5 h-5 text-slate-400" />
      <input
        type="text"
        placeholder="Search by title, author, or ISBN..."
        className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
    </div>

    {/* Performance Indicator */}
    {searchMetrics && !loading && (
      <div className={`mt-2 flex items-center gap-2 text-xs px-2 animate-in fade-in slide-in-from-top-2 duration-300`}>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${searchMetrics.isCached
          ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400'
          : 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400'
          }`}>
          {searchMetrics.isCached ? <Zap className="w-3 h-3" /> : <Database className="w-3 h-3" />}
          <span className="font-semibold">{searchMetrics.source}</span>
        </div>
        <span className="text-slate-500">Latency: <span className="font-mono font-medium">{searchMetrics.time}ms</span></span>
        {searchMetrics.isCached && <span className="text-green-600 font-medium ml-1">~Fast</span>}
      </div>
    )}
  </div>
);

const SettingsView = ({ addLog }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ borrowPeriod: 14, finePerDay: 10 });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings({ borrowPeriod: data.borrowPeriod, finePerDay: data.finePerDay });
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        addLog('ADMIN', 'Updated system settings', 'success');
        alert('Settings saved!');
      } else {
        alert('Failed to save settings');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving settings');
    }
  };

  if (loading) return <div className="text-slate-400">Loading settings...</div>;

  return (
    <Card className="max-w-xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
        <Settings className="w-6 h-6" /> System Configuration
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Borrow Period (Days)
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="number"
              value={settings.borrowPeriod}
              onChange={(e) => setSettings({ ...settings, borrowPeriod: parseInt(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Default number of days a student can borrow a book.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Fine Per Day (₹)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="number"
              value={settings.finePerDay}
              onChange={(e) => setSettings({ ...settings, finePerDay: parseInt(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Penalty amount charged per day for overdue books.</p>
        </div>

        <Button onClick={handleSave} className="w-full" icon={RefreshCw}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
};

const ActiveLoansView = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/loans')
      .then(res => res.json())
      .then(data => {
        setLoans(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="text-slate-400">Loading loans...</div>;

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Book className="w-5 h-5" /> Active Loans Monitoring
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Book Title</th>
              <th className="px-6 py-3">Borrowed</th>
              <th className="px-6 py-3">Due Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Fine</th>
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No active loans found.</td>
              </tr>
            ) : loans.map(loan => (
              <tr key={loan._id} className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                  {loan.userId}
                </td>
                <td className="px-6 py-4">{loan.book?.title || 'Unknown'}</td>
                <td className="px-6 py-4">{new Date(loan.borrowDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">{new Date(loan.dueDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {loan.overdueDays > 0 ? (
                    <Badge variant="danger">Overdue ({loan.overdueDays} days)</Badge>
                  ) : (
                    <Badge variant="success">On Time</Badge>
                  )}
                </td>
                <td className="px-6 py-4 font-mono font-medium">
                  {loan.fine > 0 ? <span className="text-red-500">₹{loan.fine}</span> : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const DashboardView = ({
  session, books, loading, searchMetrics, query, setQuery, borrowedBooks, logs,
  fetchBooks, handleBorrow, handleReturn, handleDelete, setIsAddModalOpen,
  userTransactions
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricsCard
        title="Total Books"
        value={books.length || '-'}
        subtext="In current view"
        icon={Book}
        color="bg-blue-500"
      />
      <MetricsCard
        title="Active Session"
        value="Online"
        subtext={session?.user?.email}
        icon={User}
        color="bg-indigo-500"
      />
      <MetricsCard
        title="System Status"
        value="Healthy"
        subtext="Next.js + MongoDB + Redis"
        icon={Activity}
        color="bg-green-500"
      />
      <MetricsCard
        title={session?.user?.role === 'admin' ? 'Role' : 'Borrowed Books'}
        value={session?.user?.role === 'admin' ? 'Admin' : (borrowedBooks.length || '0')}
        subtext={session?.user?.role === 'admin' ? 'Access Level' : 'Active Loans'}
        icon={session?.user?.role === 'admin' ? Shield : Book}
        color="bg-purple-500"
      />
    </div>

    {/* Student: Active Loans Overview */}
    {session?.user?.role !== 'admin' && userTransactions && userTransactions.length > 0 && (
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" /> My Active Loans
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {userTransactions.map(tx => {
            const isOverdue = new Date() > new Date(tx.dueDate);
            const book = books.find(b => b._id === tx.bookId) || { title: 'Loading...' }; // Ideally fetch book details
            return (
              <div key={tx._id} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-1">
                  {/* We might not have book title here if not in current search view, 
                       but for now assumes books are loaded or we use ID. 
                       In a real app, userTransactions should populate book details. 
                       For this quick implementation, we rely on search view or separate fetch.
                   */}
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate w-32">
                    {/* Improving this: match ID with loaded books */}
                    {books.find(b => b._id === tx.bookId)?.title || "Book ID: " + tx.bookId.substring(0, 8) + "..."}
                  </span>
                  {isOverdue ? (
                    <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">Overdue</span>
                  ) : (
                    <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded">Active</span>
                  )}
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Due: {new Date(tx.dueDate).toLocaleDateString()}</span>
                  {tx.fine > 0 && <span className="font-bold text-red-500">Fine: ₹{tx.fine}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <SearchBar
          query={query}
          setQuery={setQuery}
          loading={loading}
          searchMetrics={searchMetrics}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Library Catalog</h3>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-xs" onClick={() => fetchBooks('')}>Refresh</Button>
              {session?.user?.role === 'admin' && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="text-xs flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-3 h-3" /> Add Book
                </Button>
              )}
            </div>
          </div>

          {books.map((book) => (
            <Card key={book._id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-16 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center text-slate-400 flex-shrink-0">
                <Book className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="truncate pr-2">
                    <h4 className="font-medium text-slate-900 dark:text-white truncate">{book.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{book.author}</p>
                  </div>
                  <Badge variant={book.status === 'available' ? 'success' : 'warning'}>
                    {book.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400 font-mono hidden sm:block">ISBN: {book.isbn}</span>

                  {borrowedBooks.includes(book._id) ? (
                    <Button
                      onClick={() => handleReturn(book._id, book.title)}
                      className="px-3 py-1 h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white border-none"
                    >
                      Return Book
                    </Button>
                  ) : (
                    book.status === 'available' ? (
                      <Button
                        onClick={() => handleBorrow(book._id, book.title)}
                        variant="primary"
                        className="px-3 py-1 h-8 text-xs"
                      >
                        Borrow
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unavailable</span>
                    )
                  )}

                  {session?.user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(book._id, book.title)}
                      className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="Delete Book"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {books.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <Book className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No books found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Real-time Logs */}
      <div className="space-y-6">
        <Card className="p-0 overflow-hidden h-full max-h-[600px] flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4" /> System Events
            </h3>
            <Badge variant="neutral">Live</Badge>
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
            <SystemLogs logs={logs} />
          </div>
        </Card>
      </div>
    </div>
  </div>
);

export default function App() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Data State
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMetrics, setSearchMetrics] = useState(null);
  const [logs, setLogs] = useState([]); // Local logs state
  const [borrowedBooks, setBorrowedBooks] = useState([]); // IDs only
  const [userTransactions, setUserTransactions] = useState([]); // Full objects
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const addLog = (action, details, type = 'info') => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      action,
      details,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // Initial Load & Debounced Search
  useEffect(() => {
    if (session) {
      fetchBorrowedBooks();
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      const delaySearch = setTimeout(() => {
        fetchBooks(query);
      }, 500);
      return () => clearTimeout(delaySearch);
    }
  }, [query, session]);

  async function fetchBorrowedBooks() {
    try {
      const res = await fetch('/api/user/transactions');
      if (res.ok) {
        const data = await res.json();
        setBorrowedBooks(data.borrowedBookIds || []);
        setUserTransactions(data.activeLoans || []);
      }
    } catch (error) {
      console.error("Failed to fetch borrowed books", error);
    }
  }

  async function fetchBooks(searchQuery) {
    setLoading(true);
    try {
      const startTime = performance.now();
      const res = await fetch(`/api/books/search?q=${searchQuery || ''}`);
      const result = await res.json();
      const endTime = performance.now();

      setBooks(result.data || []);

      if (searchQuery) {
        const isCached = result.source === 'redis';
        setSearchMetrics({
          source: result.source === 'redis' ? 'Redis Cache' : 'MongoDB',
          time: Math.round(endTime - startTime),
          isCached
        });
        if (isCached) {
          addLog('CACHE HIT', `served "${searchQuery}" from Redis`, 'success');
        } else {
          addLog('DB QUERY', `fetched "${searchQuery}" from MongoDB`, 'warning');
        }
      } else {
        setSearchMetrics(null);
      }
    } catch (error) {
      console.error("Search failed:", error);
      addLog('ERROR', 'Search operation failed', 'danger');
    } finally {
      setLoading(false);
    }
  }

  async function handleBorrow(bookId, bookTitle) {
    addLog('QUEUE', `Borrow request for "${bookTitle}"...`, 'info');
    try {
      const res = await fetch('/api/books/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });

      const result = await res.json();

      if (res.ok) {
        addLog('SUCCESS', `Borrowed "${bookTitle}"`, 'success');
        // alert("Book borrowed successfully!"); // Removing alert for smoother UI
        fetchBooks(query);
        fetchBorrowedBooks();
      } else {
        addLog('FAILED', `Could not borrow "${bookTitle}": ${result.message}`, 'danger');
        alert(`Failed to borrow: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Borrowing failed:", error);
      addLog('ERROR', 'Network error during borrowing', 'danger');
      alert("Network error. Please try again later.");
    }
  }

  async function handleReturn(bookId, bookTitle) {
    addLog('QUEUE', `Return request for "${bookTitle}"...`, 'info');
    try {
      const res = await fetch('/api/books/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });

      const result = await res.json();

      if (res.ok) {
        addLog('SUCCESS', `Returned "${bookTitle}"`, 'success');
        // alert("Book returned successfully!");
        fetchBooks(query);
        fetchBorrowedBooks();
      } else {
        addLog('FAILED', `Could not return "${bookTitle}": ${result.message}`, 'danger');
        alert(`Failed to return: ${result.message}`);
      }
    } catch (error) {
      console.error("Return failed:", error);
      addLog('ERROR', 'Network error during return', 'danger');
    }
  }

  async function handleDelete(bookId, bookTitle) {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"?`)) return;

    try {
      const res = await fetch('/api/books/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });

      const result = await res.json();

      if (res.ok) {
        addLog('ADMIN', `Deleted "${bookTitle}"`, 'warning');
        fetchBooks(query);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  const handleBookAdded = (newBook) => {
    addLog('ADMIN', `Added new book: "${newBook.title}"`, 'success');
    fetchBooks(query);
  };

  // --- MAIN RENDER ---
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar user={session.user} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Mobile Header */}
      <div className="md:hidden p-4 bg-slate-900 text-white flex justify-between items-center">
        <span className="font-bold">LibStack</span>
        <button onClick={() => signOut()}><LogOut className="w-5 h-5" /></button>
      </div>

      {/* Main Content Area */}
      <main className="md:ml-64 p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
              {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Welcome back, {session.user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
            >
              {isDarkMode ? <Zap className="w-5 h-5 fill-current" /> : <Clock className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <DashboardView
            session={session}
            books={books}
            loading={loading}
            searchMetrics={searchMetrics}
            query={query}
            setQuery={setQuery}
            borrowedBooks={borrowedBooks}
            logs={logs}
            fetchBooks={fetchBooks}
            handleBorrow={handleBorrow}
            handleReturn={handleReturn}
            handleDelete={handleDelete}
            setIsAddModalOpen={setIsAddModalOpen}
            userTransactions={userTransactions}
          />
        )}

        {activeTab === 'settings' && <SettingsView addLog={addLog} />}
        {activeTab === 'loans' && <ActiveLoansView />}

        {(activeTab !== 'dashboard' && activeTab !== 'books' && activeTab !== 'settings' && activeTab !== 'loans') && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <Settings className="w-16 h-16 mb-4 opacity-20" />
            <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300">Section Under Construction</h2>
            <p className="mt-2">The {activeTab} module is coming soon.</p>
          </div>
        )}
      </main>

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookAdded={handleBookAdded}
      />
    </div>
  );
}