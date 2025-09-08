import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Users, Calendar, Star } from 'lucide-react';

// Modern Page Header Component
interface ModernPageHeaderProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  gradient?: 'primary' | 'vibrant' | 'success' | 'warning';
}

export const ModernPageHeader: React.FC<ModernPageHeaderProps> = ({
  title,
  description,
  icon: Icon = Sparkles,
  children,
  gradient = 'primary'
}) => {
  const gradientClasses = {
    primary: 'bg-gradient-to-r from-sky-400 via-blue-500 to-purple-600',
    vibrant: 'bg-gradient-to-r from-sky-400 via-emerald-500 to-amber-500',
    success: 'bg-gradient-to-r from-emerald-400 to-teal-600',
    warning: 'bg-gradient-to-r from-amber-400 to-orange-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-8 text-white mb-8',
        gradientClasses[gradient]
      )}
    >
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{title}</h1>
              <p className="text-xl opacity-90">{description}</p>
            </div>
          </div>
          {children && (
            <div className="flex items-center space-x-4">
              {children}
            </div>
          )}
        </div>
      </div>
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
    </motion.div>
  );
};

// Modern Statistics Card
interface ModernStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose';
  onClick?: () => void;
}

export const ModernStatsCard: React.FC<ModernStatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'blue',
  onClick
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-600',
    emerald: 'from-emerald-500 to-teal-600',
    purple: 'from-purple-500 to-indigo-600',
    amber: 'from-amber-500 to-orange-600',
    rose: 'from-rose-500 to-pink-600'
  };

  const changeColors = {
    positive: 'text-emerald-600 bg-emerald-100',
    negative: 'text-rose-600 bg-rose-100',
    neutral: 'text-slate-600 bg-slate-100'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'cursor-pointer',
        onClick && 'hover:shadow-xl transition-shadow duration-300'
      )}
    >
      <Card className="modern-card border-0 overflow-hidden">
        <CardContent className="p-6">
          <div className={cn(
            'bg-gradient-to-br text-white p-4 rounded-xl mb-4',
            colorClasses[color]
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
              </div>
              <Icon className="h-8 w-8 text-white/90" />
            </div>
          </div>
          {change && (
            <div className="flex items-center">
              <Badge className={cn(
                'text-xs font-medium',
                changeColors[changeType]
              )}>
                {changeType === 'positive' && '+'}
                {change}
              </Badge>
              <span className="text-sm text-slate-600 ml-2">vs last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Modern Action Button
interface ModernActionButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ModernActionButton: React.FC<ModernActionButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  className,
  onClick
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/25',
    secondary: 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-lg shadow-slate-500/25',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25',
    danger: 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/25'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-12 py-6 text-xl'
  };

  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'relative overflow-hidden rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl border-0',
        variants[variant],
        sizes[size],
        className
      )}
    >
      <div className="flex items-center space-x-2">
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          Icon && <Icon className="h-5 w-5" />
        )}
        <span>{children}</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </Button>
  );
};

// Modern Tab Header
interface ModernTabHeaderProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    count?: number;
  }>;
  activeTab: string;
  onChange: (tabId: string) => void;
}

export const ModernTabHeader: React.FC<ModernTabHeaderProps> = ({
  tabs,
  activeTab,
  onChange
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20 mb-6">
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300',
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span>{tab.label}</span>
              {tab.count && (
                <Badge className={cn(
                  'ml-2',
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                )}>
                  {tab.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Modern Progress Bar
interface ModernProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: 'blue' | 'emerald' | 'purple' | 'amber';
  size?: 'sm' | 'md' | 'lg';
}

export const ModernProgressBar: React.FC<ModernProgressBarProps> = ({
  value,
  max = 100,
  label,
  color = 'blue',
  size = 'md'
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    blue: 'from-sky-400 to-blue-600',
    emerald: 'from-emerald-400 to-teal-600',
    purple: 'from-purple-400 to-indigo-600',
    amber: 'from-amber-400 to-orange-600'
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm font-medium text-slate-700">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn(
        'w-full bg-slate-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn(
            'h-full bg-gradient-to-r rounded-full',
            colorClasses[color]
          )}
        />
      </div>
    </div>
  );
};

// Modern Alert Component
interface ModernAlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  onClose?: () => void;
}

export const ModernAlert: React.FC<ModernAlertProps> = ({
  type,
  title,
  message,
  onClose
}) => {
  const typeConfig = {
    info: {
      bg: 'from-sky-50 to-blue-50',
      border: 'border-sky-200',
      icon: 'text-sky-600',
      title: 'text-sky-800',
      message: 'text-sky-700'
    },
    success: {
      bg: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-200',
      icon: 'text-emerald-600',
      title: 'text-emerald-800',
      message: 'text-emerald-700'
    },
    warning: {
      bg: 'from-amber-50 to-orange-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      title: 'text-amber-800',
      message: 'text-amber-700'
    },
    error: {
      bg: 'from-rose-50 to-red-50',
      border: 'border-rose-200',
      icon: 'text-rose-600',
      title: 'text-rose-800',
      message: 'text-rose-700'
    }
  };

  const config = typeConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'p-4 rounded-xl border bg-gradient-to-r',
        config.bg,
        config.border
      )}
    >
      <div className="flex justify-between">
        <div>
          <h4 className={cn('font-semibold', config.title)}>{title}</h4>
          <p className={cn('text-sm mt-1', config.message)}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn('text-sm font-medium hover:underline', config.title)}
          >
            Dismiss
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default {
  ModernPageHeader,
  ModernStatsCard,
  ModernActionButton,
  ModernTabHeader,
  ModernProgressBar,
  ModernAlert
};