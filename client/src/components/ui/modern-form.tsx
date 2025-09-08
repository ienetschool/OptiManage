import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Info, ArrowLeft, ArrowRight, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormTab {
  id: string;
  title: string;
  icon?: React.ReactNode;
  description?: string;
  required?: boolean;
  completed?: boolean;
  hasErrors?: boolean;
}

export interface ModernFormProps {
  title: string;
  description?: string;
  tabs: FormTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
  className?: string;
  showProgress?: boolean;
  allowTabSwitch?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export function ModernForm({
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
  onSave,
  onCancel,
  children,
  className,
  showProgress = true,
  allowTabSwitch = true,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  isLoading = false
}: ModernFormProps) {
  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const completedTabs = tabs.filter(tab => tab.completed).length;
  const progressPercentage = (completedTabs / tabs.length) * 100;

  const handleNext = () => {
    if (currentTabIndex < tabs.length - 1) {
      onTabChange(tabs[currentTabIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentTabIndex > 0) {
      onTabChange(tabs[currentTabIndex - 1].id);
    }
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {showProgress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                Progress: {completedTabs} of {tabs.length} sections completed
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={allowTabSwitch ? onTabChange : undefined}>
          <TabsList className="grid w-full border-b rounded-none h-auto p-0 bg-transparent">
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={!allowTabSwitch}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                  "hover:bg-gray-50 dark:hover:bg-gray-800",
                  tab.hasErrors && "text-red-600 dark:text-red-400",
                  tab.completed && "text-green-600 dark:text-green-400"
                )}
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-sm">{tab.title}</span>
                    {tab.description && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {tab.description}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {tab.required && !tab.completed && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      Required
                    </Badge>
                  )}
                  {tab.completed && (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                  {tab.hasErrors && (
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="p-6">
            {children}
          </div>

          <div className="flex items-center justify-between p-6 border-t bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentTabIndex === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentTabIndex === tabs.length - 1}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  {cancelLabel}
                </Button>
              )}
              {onSave && (
                <Button
                  onClick={onSave}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Saving..." : saveLabel}
                </Button>
              )}
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  completed?: boolean;
  hasErrors?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  className,
  required = false,
  completed = false,
  hasErrors = false
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {required && (
          <Badge variant="outline" className="text-xs">
            Required
          </Badge>
        )}
        {completed && (
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        )}
        {hasErrors && (
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        )}
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {description}
        </p>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export interface ValidationMessageProps {
  message: string;
  type?: "error" | "warning" | "info" | "success";
  className?: string;
}

export function ValidationMessage({
  message,
  type = "error",
  className
}: ValidationMessageProps) {
  const icons = {
    error: <AlertCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />
  };

  const colors = {
    error: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    warning: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    info: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    success: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
  };

  return (
    <div className={cn(
      "flex items-center gap-2 p-3 rounded-md border text-sm",
      colors[type],
      className
    )}>
      {icons[type]}
      {message}
    </div>
  );
}