import React from 'react';
import type { ToplistSummary } from '../types';
import { Trophy } from 'lucide-react';
import { getGradientFromId } from '../utils/colors';
import { CoverCard } from './ui/CoverCard';
import { CoverGrid } from './ui/CoverGrid';
import { PageLayout } from './ui/PageLayout';

interface ToplistsViewProps {
  toplists: ToplistSummary[];
  onSelect: (id: string) => void;
}

export const ToplistsView: React.FC<ToplistsViewProps> = ({ toplists, onSelect }) => {
  return (
    <PageLayout title="排行榜">
      <CoverGrid className="xl:grid-cols-5">
        {toplists.map((list) => (
          <CoverCard
            key={list.id}
            title={list.name}
            description={list.updateFrequency || '每日更新'}
            coverSrc={list.pic}
            gradientClass={getGradientFromId(`toplist-${list.id}`)}
            placeholderIcon={
              <Trophy size={48} className="text-white/50 group-hover:scale-110 transition-transform duration-500" />
            }
            onClick={() => onSelect(list.id)}
          />
        ))}
      </CoverGrid>
    </PageLayout>
  );
};
