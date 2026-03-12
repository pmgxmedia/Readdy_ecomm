import { useState, useMemo } from 'react';
import { usePriceHistory, PriceHistoryEntry } from '../../../hooks/usePriceHistory';

const CHANGE_TYPE_LABELS: Record<PriceHistoryEntry['changeType'], string> = {
  single: 'Manual Edit',
  bulk_set: 'Bulk — Set Price',
  bulk_percent: 'Bulk — By %',
  bulk_fixed: 'Bulk — By Amount',
};

const CHANGE_TYPE_COLORS: Record<PriceHistoryEntry['changeType'], string> = {
  single: 'bg-gray-100 text-gray-700',
  bulk_set: 'bg-teal-100 text-teal-700',
  bulk_percent: 'bg-orange-100 text-orange-700',
  bulk_fixed: 'bg-rose-100 text-rose-700',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function priceDiff(oldPrice: number, newPrice: number) {
  const diff = newPrice - oldPrice;
  const pct = oldPrice > 0 ? ((diff / oldPrice) * 100).toFixed(1) : '0.0';
  return { diff, pct };
}

const PriceHistoryPage = () => {
  const { history, clearHistory } = usePriceHistory();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<PriceHistoryEntry['changeType'] | 'all'>('all');
  const [filterDirection, setFilterDirection] = useState<'all' | 'increase' | 'decrease'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const filtered = useMemo(() => {
    return history.filter((e) => {
      const matchSearch =
        !searchQuery ||
        e.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.productId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === 'all' || e.changeType === filterType;
      const matchDir =
        filterDirection === 'all' ||
        (filterDirection === 'increase' && e.newPrice > e.oldPrice) ||
        (filterDirection === 'decrease' && e.newPrice < e.oldPrice);
      return matchSearch && matchType && matchDir;
    });
  }, [history, searchQuery, filterType, filterDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (setter: () => void) => {
    setter();
    setCurrentPage(1);
  };

  // Summary stats
  const totalChanges = history.length;
  const priceIncreases = history.filter((e) => e.newPrice > e.oldPrice).length;
  const priceDecreases = history.filter((e) => e.newPrice < e.oldPrice).length;
  const uniqueProducts = new Set(history.map((e) => e.productId)).size;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Price History</h1>
          <p className="text-gray-600">A full audit log of every price change made to your products.</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-delete-bin-line text-sm"></i>
            </span>
            Clear Log
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Changes', value: totalChanges, icon: 'ri-history-line', color: 'bg-gray-900', text: 'text-white' },
          { label: 'Products Affected', value: uniqueProducts, icon: 'ri-box-line', color: 'bg-teal-500', text: 'text-white' },
          { label: 'Price Increases', value: priceIncreases, icon: 'ri-arrow-up-line', color: 'bg-green-500', text: 'text-white' },
          { label: 'Price Decreases', value: priceDecreases, icon: 'ri-arrow-down-line', color: 'bg-rose-500', text: 'text-white' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`${stat.color} w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0`}>
              <i className={`${stat.icon} ${stat.text} text-xl w-5 h-5 flex items-center justify-center`}></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none w-5 h-full">
              <i className="ri-search-line text-gray-400 text-sm"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
              placeholder="Search by product name or ID…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => handleFilterChange(() => setSearchQuery(''))}
                className="absolute inset-y-0 right-3 flex items-center w-5 h-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-sm"></i>
              </button>
            )}
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Type:</span>
            {(['all', 'single', 'bulk_set', 'bulk_percent', 'bulk_fixed'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleFilterChange(() => setFilterType(t))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  filterType === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t === 'all' ? 'All Types' : CHANGE_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Direction filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Direction:</span>
            {(['all', 'increase', 'decrease'] as const).map((d) => (
              <button
                key={d}
                onClick={() => handleFilterChange(() => setFilterDirection(d))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  filterDirection === d ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{' '}
            <span className="font-semibold text-gray-700">{history.length}</span> entries
          </p>
          {(searchQuery || filterType !== 'all' || filterDirection !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterDirection('all');
                setCurrentPage(1);
              }}
              className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {history.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full">
            <i className="ri-history-line text-3xl text-gray-400"></i>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700 text-lg">No price changes yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Every time you edit a product price, it will appear here automatically.
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-16 flex flex-col items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full">
            <i className="ri-search-line text-2xl text-gray-400"></i>
          </div>
          <p className="font-semibold text-gray-700">No results match your filters</p>
          <button
            onClick={() => { setSearchQuery(''); setFilterType('all'); setFilterDirection('all'); setCurrentPage(1); }}
            className="text-sm text-gray-600 underline cursor-pointer hover:text-gray-900"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Old Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">New Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Change</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((entry) => {
                    const { diff, pct } = priceDiff(entry.oldPrice, entry.newPrice);
                    const isIncrease = diff > 0;
                    const isDecrease = diff < 0;
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{formatDate(entry.timestamp)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatTime(entry.timestamp)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900">{entry.productName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">ID: {entry.productId}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500 line-through">${entry.oldPrice.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-bold ${isIncrease ? 'text-green-600' : isDecrease ? 'text-rose-600' : 'text-gray-700'}`}>
                            ${entry.newPrice.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${
                              isIncrease ? 'bg-green-100 text-green-600' : isDecrease ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-500'
                            }`}>
                              <i className={`${isIncrease ? 'ri-arrow-up-line' : isDecrease ? 'ri-arrow-down-line' : 'ri-subtract-line'} text-xs`}></i>
                            </span>
                            <span className={`text-sm font-semibold ${isIncrease ? 'text-green-600' : isDecrease ? 'text-rose-600' : 'text-gray-500'}`}>
                              {isIncrease ? '+' : ''}{diff.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-400">({isIncrease ? '+' : ''}{pct}%)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${CHANGE_TYPE_COLORS[entry.changeType]}`}>
                            {CHANGE_TYPE_LABELS[entry.changeType]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page <span className="font-semibold text-gray-700">{currentPage}</span> of{' '}
                <span className="font-semibold text-gray-700">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <i className="ri-arrow-left-s-line text-base"></i>
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page = i + 1;
                  if (totalPages > 5) {
                    if (currentPage <= 3) page = i + 1;
                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                    else page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <i className="ri-arrow-right-s-line text-base"></i>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-delete-bin-line text-2xl text-red-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Clear Price History?</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  This will permanently delete all {history.length} log entries. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { clearHistory(); setShowClearConfirm(false); }}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceHistoryPage;
