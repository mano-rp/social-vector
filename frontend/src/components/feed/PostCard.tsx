import React, { useState } from 'react';
import { PostRecord, UserRecord } from '../../types/dataset';
import { Avatar } from '../common/Avatar';
import {
  Heart,
  Repeat2,
  MessageCircle,
  Eye,
  ExternalLink,
  ShieldCheck,
  Activity,
  Quote,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataset } from '../../context/DatasetContext';

interface PostCardProps {
  post: PostRecord;
  author?: UserRecord;
  datasetId: string;
  onHashtagClick?: (tag: string) => void;
  onDomainClick?: (domain: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  author,
  datasetId,
  onHashtagClick,
  onDomainClick,
}) => {
  const navigate = useNavigate();
  const { openAnalysis } = useDataset();
  const [isExpanded, setIsExpanded] = useState(false);

  const authorName = author?.display_name || post.author_id;
  const authorHandle = author?.username || post.author_id;
  const isVerified = author?.verified ?? false;

  const formattedDate = new Date(post.created_at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const renderFormattedContent = (text: string) => {
    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, pIdx) => {
      const words = para.split(' ');
      return (
        <p key={pIdx} className="mb-2.5 last:mb-0 leading-relaxed text-sm text-slate-800 dark:text-slate-200">
          {words.map((word, wIdx) => {
            if (word.startsWith('#') && word.length > 1) {
              const cleanTag = word.replace(/[^a-zA-Z0-9_]/g, '');
              return (
                <span
                  key={wIdx}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onHashtagClick) onHashtagClick(cleanTag);
                  }}
                  className="text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer font-medium"
                >
                  {word}{' '}
                </span>
              );
            }
            if (word.startsWith('@') && word.length > 1) {
              return (
                <span key={wIdx} className="text-slate-600 dark:text-slate-400 font-medium">
                  {word}{' '}
                </span>
              );
            }
            if (word.startsWith('http://') || word.startsWith('https://')) {
              return (
                <a
                  key={wIdx}
                  href={word}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-0.5 break-all"
                >
                  {word} <ExternalLink className="w-3 h-3 inline" />{' '}
                </a>
              );
            }
            return word + ' ';
          })}
        </p>
      );
    });
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (author) {
      navigate(`/datasets/${datasetId}/users/${author.user_id}`);
    }
  };

  const handleAnalyseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (author) {
      openAnalysis('feed', author.user_id, author);
    }
  };

  const isContentLong = post.content.length > 380;
  const displayContent = isContentLong && !isExpanded
    ? post.content.slice(0, 350) + '...'
    : post.content;

  return (
    <article className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141c] hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={handleAuthorClick}>
          <Avatar name={authorName} username={authorHandle} size="md" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:underline">
                {authorName}
              </span>
              {isVerified && (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span>@{authorHandle}</span>
              <span>·</span>
              <time dateTime={post.created_at}>{formattedDate}</time>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post.client_source && (
            <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              {post.client_source}
            </span>
          )}
          <button
            onClick={handleAnalyseClick}
            title="Analyse this user's feed in the analysis lab"
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded transition-colors"
          >
            <Activity className="w-3 h-3 text-slate-400 dark:text-cyan-400" />
            <span className="hidden sm:inline">Analyse</span>
          </button>
        </div>
      </div>

      <div className="pl-0 sm:pl-11">
        <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200">
          {renderFormattedContent(displayContent)}
        </div>

        {isContentLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 dark:text-cyan-400 font-medium hover:underline mt-1 mb-2 block"
          >
            {isExpanded ? 'Show less' : 'Read full post'}
          </button>
        )}

        {post.entities.urls.length > 0 && (
          <div className="my-2.5 p-2 rounded bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1">
            {post.entities.urls.map((u, i) => {
              const domain = u.replace(/^https?:\/\//, '').split('/')[0];
              return (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span
                      onClick={() => onDomainClick && onDomainClick(domain)}
                      className="font-mono text-slate-700 dark:text-slate-300 hover:underline cursor-pointer truncate text-[11px]"
                    >
                      {domain}
                    </span>
                  </div>
                  <a
                    href={u}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline shrink-0 ml-2"
                  >
                    Open Link &rarr;
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-5 sm:gap-7 pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 text-xs font-mono">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            <span>{post.metrics.likes_count.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 className="w-3.5 h-3.5" />
            <span>{post.metrics.reposts_count.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{post.metrics.replies_count.toLocaleString()}</span>
          </span>
          {post.metrics.quotes_count > 0 && (
            <span className="flex items-center gap-1">
              <Quote className="w-3.5 h-3.5" />
              <span>{post.metrics.quotes_count.toLocaleString()}</span>
            </span>
          )}
          {post.metrics.impressions_count > 0 && (
            <span className="flex items-center gap-1 ml-auto">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.metrics.impressions_count.toLocaleString()}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
