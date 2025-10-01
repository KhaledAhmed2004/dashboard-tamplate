import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Zap } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  value: string;
  trend?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
  actionLabel?: string;
  onAction?: () => void;
}

const colorVariants = {
  blue: {
    gradient: 'from-blue-500/10 via-blue-600/5 to-blue-700/10',
    iconBg: 'from-blue-100 to-blue-200',
    accent: 'from-blue-500 to-blue-600',
    text: 'text-blue-600'
  },
  purple: {
    gradient: 'from-purple-500/10 via-purple-600/5 to-purple-700/10',
    iconBg: 'from-purple-100 to-purple-200',
    accent: 'from-purple-500 to-purple-600',
    text: 'text-purple-600'
  },
  green: {
    gradient: 'from-green-500/10 via-green-600/5 to-green-700/10',
    iconBg: 'from-green-100 to-green-200',
    accent: 'from-green-500 to-green-600',
    text: 'text-green-600'
  },
  orange: {
    gradient: 'from-orange-500/10 via-orange-600/5 to-orange-700/10',
    iconBg: 'from-orange-100 to-orange-200',
    accent: 'from-orange-500 to-orange-600',
    text: 'text-orange-600'
  },
  pink: {
    gradient: 'from-pink-500/10 via-pink-600/5 to-pink-700/10',
    iconBg: 'from-pink-100 to-pink-200',
    accent: 'from-pink-500 to-pink-600',
    text: 'text-pink-600'
  }
};

export function FeatureCard({ 
  title, 
  description, 
  value, 
  trend, 
  icon = <TrendingUp className="h-5 w-5" />, 
  color = 'blue',
  actionLabel,
  onAction 
}: FeatureCardProps) {
  const colors = colorVariants[color];

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Animated background overlay */}
      <aside className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Animated border */}
      <aside className={`absolute inset-0 bg-gradient-to-r ${colors.accent} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
      <aside className="absolute inset-[1px] bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-[calc(0.5rem-1px)]" />
      
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <aside className="space-y-1">
          <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors duration-200">
            {title}
          </CardTitle>
          {trend && (
            <aside className={`flex items-center space-x-1 text-xs ${colors.text}`}>
              <TrendingUp className="h-3 w-3" />
              <span>{trend}</span>
            </aside>
          )}
        </aside>
        <aside className={`p-3 rounded-xl bg-gradient-to-br ${colors.iconBg} group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
          {icon}
        </aside>
      </CardHeader>
      
      <CardContent className="relative space-y-3">
        <aside className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
          {value}
        </aside>
        
        <CardDescription className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-200">
          {description}
        </CardDescription>
        
        {actionLabel && onAction && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onAction}
            className={`mt-3 ${colors.text} hover:bg-slate-100 group-hover:translate-x-1 transition-all duration-200`}
          >
            {actionLabel}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
        
        {/* Animated bottom accent */}
        <aside className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${colors.accent} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full`} />
      </CardContent>
    </Card>
  );
}