import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  value: string;
  trend?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
  actionLabel?: string;
  onAction?: () => void;
  disableHover?: boolean;
}

const colorVariants = {
  blue: { text: 'text-blue-600' },
  purple: { text: 'text-purple-600' },
  green: { text: 'text-green-600' },
  orange: { text: 'text-orange-600' },
  pink: { text: 'text-pink-600' },
};

export function FeatureCard({ 
  title, 
  description, 
  value, 
  trend, 
  icon = <TrendingUp className="h-5 w-5" />, 
  color = 'blue',
  actionLabel,
  onAction,
  disableHover = false,
}: FeatureCardProps) {
  const colors = colorVariants[color];
  // mark prop as used to satisfy strict noUnusedParameters when hover is disabled globally
  void disableHover;

  return (
    <Card>
      
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <aside className="space-y-1">
          <CardTitle className="text-sm font-semibold">
            {title}
          </CardTitle>
          {trend && (
            <aside className={`flex items-center space-x-1 text-xs ${colors.text}`}>
              <TrendingUp className="h-3 w-3" />
              <span>{trend}</span>
            </aside>
          )}
        </aside>
        <aside className="p-3 rounded-xl bg-muted shadow-sm">
          {icon}
        </aside>
      </CardHeader>
      
      <CardContent className="relative space-y-3">
        <aside className="text-3xl font-bold">
          {value}
        </aside>
        
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
        
        {actionLabel && onAction && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onAction}
            className={`mt-3 ${colors.text}`}
          >
            {actionLabel}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}