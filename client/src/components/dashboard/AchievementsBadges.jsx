import { motion } from 'framer-motion';
import { Star, Flame, Users, Trophy, Award } from 'lucide-react';

const achievementIcons = {
  FIRST_SALE: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  STREAK_7: { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  HUNDRED_CUSTOMERS: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  FIVE_STARS: { icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  TOP_SELLER: { icon: Award, color: 'text-green-400', bg: 'bg-green-500/20' },
};

const AchievementsBadges = ({ achievements }) => {
  if (!achievements?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5"
    >
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" />
        Tus Logros
      </h3>
      <div className="flex flex-wrap gap-3">
        {achievements.map((achievement) => {
          const config = achievementIcons[achievement.type] || {
            icon: Award,
            color: 'text-gray-400',
            bg: 'bg-gray-500/20',
          };
          const Icon = config.icon;
          return (
            <div
              key={achievement.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl ${config.bg} border border-white/5`}
            >
              <Icon className={`w-5 h-5 ${config.color}`} />
              <span className="font-medium text-gray-300">
                {achievement.type.replace(/_/g, ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AchievementsBadges;
