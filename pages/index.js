import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Search, Book, Database, Zap, User, Library, Shield,
  LayoutDashboard, Settings, Activity, Clock, LogOut, RefreshCw, Server
} from 'lucide-react';
import { Card, Button, Badge } from '../components/LibraryUI';
import Sidebar from '../components/Sidebar';
import { MetricsCard, SystemLogs } from '../components/DashboardWidgets';
import AddBookModal from '../components/AddBookModal';
import { Plus } from 'lucide-react';

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
  const [borrowedBooks, setBorrowedBooks] = useState([]);
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

  const handleBookAdded = (newBook) => {
    addLog('ADMIN', `Added new book: "${newBook.title}"`, 'success');
    fetchBooks(query);
  };

  // --- SUB-COMPONENTS ---

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

  const SearchBar = () => (
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

  const DashboardView = () => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SearchBar />

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
              {activeTab === 'dashboard' ? 'Overview' : activeTab}
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

        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'books' && <DashboardView />} {/* Reusing dashboard for books tab for now */}

        {(activeTab !== 'dashboard' && activeTab !== 'books') && (
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