import { useState } from 'react';
import { Send, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export function QueryInput({ fileId, onQueryResult }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analysis/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ query, fileId }),
      });

      const data = await response.json();

      if (data.success) {
        onQueryResult(data.results);
        setQuery('');
        toast.success('Analysis completed!');
      } else {
        toast.error(data.message || 'Query failed');
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Ask a Question
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Show top 5 products by revenue, What is the average order value?"
          className="input-base flex-1"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex items-center gap-2 px-6"
        >
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        💡 Tip: Ask questions in natural language like "Show sales by region" or "Top 10 customers"
      </p>
    </form>
  );
}
