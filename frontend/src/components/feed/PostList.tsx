import React, { useState, useMemo } from 'react';
import { PostRecord, UserRecord } from '../../types/dataset';
import { PostCard } from './PostCard';
import { EmptyState } from '../common/EmptyState';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';

interface PostListProps {
  posts: PostRecord[];
  userMap: Map<string, UserRecord>;
  datasetId: string;
  initialHashtag?: string;
  initialAuthorId?: string;
}

export const PostList: React.FC<PostListProps> = ({
  posts,
  userMap,
  datasetId,
  initialHashtag = '',
  initialAuthorId = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(initialHashtag);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { topTags, topDomains } = useMemo(() => {
    const tagCounts = new Map<string, number>();
    const domainCounts = new Map<string, number>();

    for (const p of posts) {
      for (const t of p.entities.hashtags) {
        tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
      }
      for (const u of p.entities.urls) {
        const domain = u.replace(/^https?:\/\//, '').split('/')[0];
        if (domain) {
          domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
        }
      }
    }

    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);

    const sortedDomains = Array.from(domainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([domain]) => domain);

    return { topTags: sortedTags, topDomains: sortedDomains };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (initialAuthorId) {
      result = result.filter(p => p.author_id === initialAuthorId);
    }

    if (selectedTag) {
      result = result.filter(p => p.entities.hashtags.includes(selectedTag));
    }

    if (selectedDomain) {
      result = result.filter(p =>
        p.entities.urls.some(u => u.includes(selectedDomain))
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const author = userMap.get(p.author_id);
        const matchContent = p.content.toLowerCase().includes(q);
        const matchAuthor = author
          ? author.display_name.toLowerCase().includes(q) || author.username.toLowerCase().includes(q)
          : p.author_id.toLowerCase().includes(q);
        const matchTag = p.entities.hashtags.some(t => t.toLowerCase().includes(q));
        const matchUrl = p.entities.urls.some(u => u.toLowerCase().includes(q));
        return matchContent || matchAuthor || matchTag || matchUrl;
      });
    }

    result.sort((a, b) => {
      const tA = new Date(a.created_at).getTime();
      const tB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? tB - tA : tA - tB;
    });

    return result;
  }, [posts, userMap, searchQuery, selectedTag, selectedDomain, sortOrder, initialAuthorId]);

  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const paginatedPosts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, page]);

  const hasActiveFilters = !!(searchQuery || selectedTag || selectedDomain);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag('');
    setSelectedDomain('');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="p-3 bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 rounded-lg space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search post content, authors, or hashtags..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}</span>
          </button>
        </div>

        {(topTags.length > 0 || topDomains.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase mr-1">Filter:</span>

            {topTags.slice(0, 6).map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(selectedTag === tag ? '' : tag);
                  setPage(1);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                  selectedTag === tag
                    ? 'border-slate-900 dark:border-cyan-400 bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/60'
                }`}
              >
                #{tag}
              </button>
            ))}

            {topDomains.slice(0, 4).map(dom => (
              <button
                key={dom}
                onClick={() => {
                  setSelectedDomain(selectedDomain === dom ? '' : dom);
                  setPage(1);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                  selectedDomain === dom
                    ? 'border-slate-900 dark:border-cyan-400 bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/60'
                }`}
              >
                {dom}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:underline ml-auto font-mono"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
        <span>
          Showing {paginatedPosts.length} of {filteredPosts.length} posts
          {hasActiveFilters && ' (filtered)'}
        </span>
        {totalPages > 1 && (
          <span>
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      {paginatedPosts.length > 0 ? (
        <div className="space-y-3">
          {paginatedPosts.map((post) => (
            <PostCard
              key={post.post_id}
              post={post}
              author={userMap.get(post.author_id)}
              datasetId={datasetId}
              onHashtagClick={(t) => {
                setSelectedTag(t);
                setPage(1);
              }}
              onDomainClick={(d) => {
                setSelectedDomain(d);
                setPage(1);
              }}
            />
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 pb-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                &larr; Previous
              </button>
              <span className="text-xs text-slate-500 font-mono px-3">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<Filter className="w-6 h-6" />}
          title="No posts match your filters"
          description="Try broadening your search query or removing hashtag/domain filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      )}
    </div>
  );
};
