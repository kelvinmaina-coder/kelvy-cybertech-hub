import React from "react";
import { useSearchParams } from "react-router-dom";
import { AppRole, useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export interface DomainTab {
  id: string;
  label: string;
  icon: React.ElementType;
  component: React.ReactNode;
  roles?: AppRole[];
}

interface DomainLayoutProps {
  title: string;
  description: string;
  icon: React.ElementType;
  tabs: DomainTab[];
  defaultTab?: string;
  basePath: string;
}

export default function DomainLayout({ title, description, icon: Icon, tabs, defaultTab, basePath }: DomainLayoutProps) {
  const [searchParams] = useSearchParams();
  const { roles } = useAuth();
  
  // Filter tabs by user role
  const visibleTabs = tabs.filter(tab => !tab.roles || tab.roles.some(r => roles.includes(r)));
  
  // Determine active tab
  const activeTabId = searchParams.get("tab") || defaultTab || (visibleTabs.length > 0 ? visibleTabs[0].id : "");
  
  const activeTab = visibleTabs.find(t => t.id === activeTabId) || visibleTabs[0];

  return (
    <div className="space-y-6">
      {/* Domain Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-xl border border-border/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-primary/5 blur-3xl rounded-full translate-x-1/2" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-glow-green">
              {title}
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg mt-1 relative z-10">{description}</p>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex bg-muted/40 p-1.5 rounded-lg border border-border/50 overflow-x-auto hide-scrollbar sticky top-0 z-20 backdrop-blur-md">
        {visibleTabs.map((tab) => {
          const isActive = activeTab?.id === tab.id;
          return (
            <Link
              key={tab.id}
              to={`${basePath}?tab=${tab.id}`}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all whitespace-nowrap min-w-max ${
                isActive
                  ? "bg-primary/20 text-primary shadow-sm border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? "text-primary" : "opacity-70"}`} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="min-h-[50vh] animate-fade-in">
        {activeTab ? activeTab.component : (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">Select a tab from the menu above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
